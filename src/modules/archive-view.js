import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';

let containerEl = null;
let items = [];
let selectedItemId = null;

/**
 * Mount the Archive view.
 */
export function renderArchiveView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'archive-view';
  container.appendChild(containerEl);

  items = Repository.getByModule('archive').sort((a, b) => b.updatedAt - a.updatedAt);

  if (selectedItemId && !items.find(i => i.id === selectedItemId)) {
    setSelectedItemId(null);
  }

  renderView();

  cleanupEventBus();
  EventBus.on('itemCreated', handleItemChange);
  EventBus.on('itemUpdated', handleItemChange);
  EventBus.on('itemDeleted', handleItemChange);
  EventBus.on('itemMoved', handleItemChange);

  window.removeEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('keydown', handleGlobalKeydown);

  // Monitor element removal to cleanup event handlers
  const observer = new MutationObserver(() => {
    if (!document.body.contains(containerEl)) {
      cleanupListeners();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Focus and highlight a specific archived item.
 * Called by the Command Palette.
 */
export function focusAndSelectArchivedTask(itemId) {
  setSelectedItemId(itemId);
  const activeContainer = document.getElementById('active-view');
  if (activeContainer) renderArchiveView(activeContainer);
}

function handleItemChange() {
  items = Repository.getByModule('archive').sort((a, b) => b.updatedAt - a.updatedAt);
  renderView();
}

function setSelectedItemId(id) {
  selectedItemId = id;
  if (id) {
    const item = items.find(i => i.id === id);
    EventBus.emit('itemSelected', item || null);
  } else {
    EventBus.emit('itemSelected', null);
  }
}

function cleanupEventBus() {
  EventBus.off('itemCreated', handleItemChange);
  EventBus.off('itemUpdated', handleItemChange);
  EventBus.off('itemDeleted', handleItemChange);
  EventBus.off('itemMoved', handleItemChange);
}

function cleanupListeners() {
  cleanupEventBus();
  window.removeEventListener('keydown', handleGlobalKeydown);
  setSelectedItemId(null);
}

// --- Rendering ---
function renderView() {
  if (!containerEl) return;

  if (items.length === 0) {
    crossfade(containerEl, () => renderEmpty());
  } else {
    crossfade(containerEl, () => renderArchiveList());
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>archive</h2>
      <p>Archive is empty.</p>
      <p style="color: var(--color-text-muted); font-size: var(--font-size-xs); max-width: 320px; margin: var(--space-sm) 0 0 0; line-height: 1.4;">
        Finished work and discarded ideas will live here.
      </p>
    </div>
  `;
}

function renderArchiveList() {
  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="completed-header" style="margin-bottom: var(--space-sm);">Permanent record</div>
      <div class="tasks-list-active" id="archive-items-list" role="listbox" aria-label="Archived items"></div>
    </div>
  `;

  const listEl = document.getElementById('archive-items-list');
  items.forEach(item => {
    listEl.appendChild(buildArchiveRow(item));
  });

  // Restore keyboard focus (only if user is not editing in the Inspector)
  if (selectedItemId) {
    const activeEl = document.activeElement;
    const isEditingInInspector = activeEl && activeEl.closest('#inspector-panel');
    if (!isEditingInInspector) {
      const el = listEl.querySelector(`[data-id="${selectedItemId}"]`);
      if (el) requestAnimationFrame(() => el.focus());
    }
  }
}

function buildArchiveRow(item) {
  const row = document.createElement('div');
  row.className = 'task-item completed'; // Render muted/completed style
  row.style.opacity = '0.6'; // Make archived items feel intentionally quiet
  row.setAttribute('data-id', item.id);
  row.setAttribute('role', 'option');
  row.setAttribute('aria-selected', item.id === selectedItemId ? 'true' : 'false');
  row.setAttribute('tabindex', '0');

  if (item.id === selectedItemId) {
    row.classList.add('selected');
    row.style.opacity = '0.95'; // Make selected row visible clearly
  }

  // Title with Area name label
  const title = document.createElement('span');
  title.className = 'task-title';
  
  const area = item.areaId ? Repository.getAreas().find(a => a.id === item.areaId) : null;
  if (area) {
    const areaLabel = document.createElement('span');
    areaLabel.className = 'task-area-label';
    areaLabel.textContent = `[${area.name}] `;
    title.appendChild(areaLabel);
  }

  const textNode = document.createTextNode(item.title);
  title.appendChild(textNode);
  row.appendChild(title);

  // Relative Parked Time Badge
  const archivedTime = document.createElement('span');
  archivedTime.className = 'capture-time-badge';
  archivedTime.textContent = `archived ${getRelativeTime(item.updatedAt)}`;
  row.appendChild(archivedTime);

  // TUI plain text hover actions
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const restoreBtn = document.createElement('button');
  restoreBtn.className = 'action-btn';
  restoreBtn.textContent = 'restore';
  restoreBtn.addEventListener('click', (e) => {
    openRestorePicker(e, item);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.textContent = 'del';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(item.id);
  });

  actions.appendChild(restoreBtn);
  actions.appendChild(delBtn);
  row.appendChild(actions);

  row.addEventListener('click', () => {
    setSelectedItemId(item.id);
    renderView();
  });

  return row;
}

// --- Archive Operations ---

function openRestorePicker(e, item) {
  e.stopPropagation();

  // Remove existing dropdowns
  const existing = document.querySelector('.restore-picker-dropdown');
  if (existing) existing.remove();

  const rect = e.target.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.className = 'restore-picker-dropdown';
  
  // Align picker below the action button
  picker.style.top = `${rect.bottom + window.scrollY}px`;
  picker.style.left = `${rect.left + window.scrollX}px`;

  const destinations = [
    { name: 'Focus', value: 'focus' },
    { name: 'Capture', value: 'capture' },
    { name: 'Parking Lot', value: 'parking-lot' }
  ];

  destinations.forEach(dest => {
    const el = document.createElement('div');
    el.className = 'restore-picker-item';
    el.textContent = dest.name;
    el.addEventListener('click', () => {
      restoreItem(item, dest.value);
      picker.remove();
    });
    picker.appendChild(el);
  });

  document.body.appendChild(picker);

  // Close dropdown on click outside
  const closePicker = (event) => {
    if (!picker.contains(event.target) && event.target !== e.target) {
      picker.remove();
      document.removeEventListener('mousedown', closePicker);
    }
  };
  document.addEventListener('mousedown', closePicker);
}

function restoreItem(item, destination) {
  if (destination === 'focus') {
    const activeFocus = Repository.getByModule('focus').filter(t => t.status === 'active');
    if (activeFocus.length >= 3) {
      ToastService.show('Focus is full. Complete something first.', 'info');
      return;
    }
  }

  Repository.move(item.id, destination);
  if (selectedItemId === item.id) setSelectedItemId(null);
  ToastService.show(`Restored to ${destination === 'parking-lot' ? 'Parking Lot' : destination.charAt(0).toUpperCase() + destination.slice(1)}.`, 'success');
}

function deleteItem(itemId) {
  DialogService.confirm({
    title: 'Delete Archived Item',
    message: 'Are you sure you want to permanently delete this archived item from your history?',
    confirmText: 'Delete permanently',
    cancelText: 'Cancel',
    variant: 'danger'
  }).then((confirmed) => {
    if (confirmed) {
      Repository.remove(itemId);
      if (selectedItemId === itemId) setSelectedItemId(null);
      ToastService.show('Deleted permanently.', 'info');
    }
  });
}

// --- Keyboard Navigation ---

function handleGlobalKeydown(event) {
  if (!containerEl || !document.body.contains(containerEl)) {
    cleanupListeners();
    return;
  }

  const el = document.activeElement;
  const editing = el && (
    el.tagName === 'INPUT' || 
    el.tagName === 'TEXTAREA' || 
    el.isContentEditable
  );
  if (editing) return;

  if (!selectedItemId) {
    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault();
      setSelectedItemId(items[0].id);
      renderView();
    }
    return;
  }

  const idx = items.findIndex(i => i.id === selectedItemId);
  if (idx === -1) return;

  const currentItem = items[idx];

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (idx < items.length - 1) {
        setSelectedItemId(items[idx + 1].id);
        renderView();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (idx > 0) {
        setSelectedItemId(items[idx - 1].id);
        renderView();
      } else {
        setSelectedItemId(null);
        renderView();
      }
      break;
    case 'Enter':
    case 'r':
    case 'R':
      event.preventDefault();
      // Locate the restore button element in DOM to position picker
      const row = containerEl.querySelector(`[data-id="${selectedItemId}"]`);
      if (row) {
        const restoreBtn = [...row.querySelectorAll('.action-btn')].find(b => b.textContent === 'restore');
        if (restoreBtn) {
          openRestorePicker({ stopPropagation: () => {}, target: restoreBtn }, currentItem);
        }
      }
      break;
    case 'Escape':
      event.preventDefault();
      setSelectedItemId(null);
      renderView();
      break;
    case 'Delete':
    case 'Backspace':
      event.preventDefault();
      deleteItem(selectedItemId);
      break;
  }
}
