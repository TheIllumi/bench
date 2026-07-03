import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';
import { createInput } from '../ui/input.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';

let containerEl = null;
let items = [];
let selectedItemId = null;
let editingItemId = null;

/**
 * Mount the Parking Lot view.
 */
export function renderParkingLotView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'parking-lot-view';
  container.appendChild(containerEl);

  items = Repository.getByModule('parking-lot').sort((a, b) => b.updatedAt - a.updatedAt);

  if (selectedItemId && !items.find(i => i.id === selectedItemId)) {
    setSelectedItemId(null);
  }

  if (!selectedItemId) editingItemId = null;

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
 * Focus and highlight a specific parked item.
 * Called by the Command Palette.
 */
export function focusAndSelectParkedTask(itemId) {
  setSelectedItemId(itemId);
  const activeContainer = document.getElementById('active-view');
  if (activeContainer) renderParkingLotView(activeContainer);
}

function handleItemChange() {
  items = Repository.getByModule('parking-lot').sort((a, b) => b.updatedAt - a.updatedAt);
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
    crossfade(containerEl, () => renderParkingList());
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>parking lot</h2>
      <p>Nothing parked.</p>
      <p style="color: var(--color-text-muted); font-size: var(--font-size-xs); max-width: 320px; margin: var(--space-sm) auto; line-height: 1.4;">
        The Parking Lot is for things that matter, just not today.
      </p>
    </div>
  `;
}

function renderParkingList() {
  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="completed-header" style="margin-bottom: var(--space-sm);">Parked items</div>
      <div class="tasks-list-active" id="parking-items-list" role="listbox" aria-label="Parked items"></div>
    </div>
  `;

  const listEl = document.getElementById('parking-items-list');
  items.forEach(item => {
    listEl.appendChild(buildParkRow(item));
  });

  // Restore keyboard focus
  if (selectedItemId && !editingItemId) {
    const el = listEl.querySelector(`[data-id="${selectedItemId}"]`);
    if (el) requestAnimationFrame(() => el.focus());
  }
}

function buildParkRow(item) {
  const row = document.createElement('div');
  row.className = 'task-item';
  row.setAttribute('data-id', item.id);
  row.setAttribute('role', 'option');
  row.setAttribute('aria-selected', item.id === selectedItemId ? 'true' : 'false');
  row.setAttribute('tabindex', '0');

  if (item.id === selectedItemId) {
    row.classList.add('selected');
  }

  const isEditing = item.id === editingItemId;

  if (isEditing) {
    const input = createInput({
      value: item.title,
      onKeyDown: (e) => handleEditKeyDown(e, item.id),
      onBlur: (e) => commitEdit(item.id, e.target.value),
      className: 'task-edit-input'
    });
    row.appendChild(input);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  } else {
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
  }

  // Relative Parked Time Badge
  const parkedTime = document.createElement('span');
  parkedTime.className = 'capture-time-badge';
  parkedTime.textContent = `parked ${getRelativeTime(item.updatedAt)}`;
  row.appendChild(parkedTime);

  // TUI plain text hover actions
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const focusBtn = document.createElement('button');
  focusBtn.className = 'action-btn';
  focusBtn.textContent = 'focus';
  focusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moveToFocus(item.id);
  });

  const captureBtn = document.createElement('button');
  captureBtn.className = 'action-btn';
  captureBtn.textContent = 'capture';
  captureBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moveToCapture(item.id);
  });

  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'action-btn';
  archiveBtn.textContent = 'archive';
  archiveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moveToArchive(item.id);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.textContent = 'del';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(item.id);
  });

  actions.appendChild(focusBtn);
  actions.appendChild(captureBtn);
  actions.appendChild(archiveBtn);
  actions.appendChild(delBtn);
  row.appendChild(actions);

  if (!isEditing) {
    row.addEventListener('click', () => {
      setSelectedItemId(item.id);
      renderView();
    });
    row.addEventListener('dblclick', () => {
      startEditing(item.id);
    });
  }

  return row;
}

// --- Park Operations ---

function moveToFocus(itemId) {
  const activeFocus = Repository.getByModule('focus').filter(t => t.status === 'active');
  if (activeFocus.length >= 3) {
    ToastService.show('Focus is full. Complete something first.', 'info');
    return;
  }

  Repository.move(itemId, 'focus');
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Moved to Focus.', 'success');
}

function moveToCapture(itemId) {
  Repository.move(itemId, 'capture');
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Moved to Capture.', 'success');
}

function moveToArchive(itemId) {
  Repository.move(itemId, 'archive');
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Archived.', 'success');
}

function deleteItem(itemId) {
  DialogService.confirm({
    title: 'Delete Parked Item',
    message: 'Are you sure you want to permanently delete this parked item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'
  }).then((confirmed) => {
    if (confirmed) {
      Repository.remove(itemId);
      if (selectedItemId === itemId) setSelectedItemId(null);
      if (editingItemId === itemId) editingItemId = null;
      ToastService.show('Deleted permanently.', 'info');
    }
  });
}

function startEditing(itemId) {
  editingItemId = itemId;
  setSelectedItemId(itemId);
  renderView();
}

function handleEditKeyDown(event, itemId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitEdit(itemId, event.target.value);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    editingItemId = null;
    setSelectedItemId(null);
    renderView();
  }
}

function commitEdit(itemId, newTitle) {
  const item = items.find(i => i.id === itemId);
  const title = newTitle.trim();

  if (item && title && item.title !== title) {
    Repository.update(itemId, { title });
  }

  editingItemId = null;
  renderView();
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

  if (!selectedItemId || editingItemId) {
    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault();
      setSelectedItemId(items[0].id);
      renderView();
    }
    return;
  }

  const idx = items.findIndex(i => i.id === selectedItemId);
  if (idx === -1) return;

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
      event.preventDefault();
      startEditing(selectedItemId);
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
    case 'p':
    case 'P':
      event.preventDefault();
      moveToFocus(selectedItemId);
      break;
    case 'c':
    case 'C':
      event.preventDefault();
      moveToCapture(selectedItemId);
      break;
    case 'a':
    case 'A':
      event.preventDefault();
      moveToArchive(selectedItemId);
      break;
  }
}
