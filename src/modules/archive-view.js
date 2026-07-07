import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';
import { createSearchInput } from '../ui/search.js';

let containerEl = null;
let items = [];
let selectedItemId = null;
let filterAreaId = '';
let searchQuery = '';

/**
 * Mount the Archive view.
 */
export function renderArchiveView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'archive-view';
  container.appendChild(containerEl);

  items = Repository.getByModule('archive').sort((a, b) => b.updatedAt - a.updatedAt);
  searchQuery = '';

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
function handleSearch(query) {
  searchQuery = query;
  const contentArea = document.getElementById('view-content-area');
  if (!contentArea) return;

  let filteredItems = filterAreaId ? items.filter(t => t.areaId === filterAreaId) : items;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(t => (t.title || '').toLowerCase().includes(q));
  }

  if (items.length === 0) {
    renderEmpty(contentArea);
  } else if (filteredItems.length === 0) {
    contentArea.innerHTML = `
      <div class="placeholder-view" style="height: auto; padding: var(--space-md) 0;">
        <p style="color: var(--color-text-muted);">${searchQuery ? 'No matching tasks found.' : 'No tasks match the selected Area filter.'}</p>
      </div>
    `;
  } else {
    renderArchiveList(contentArea, filteredItems);
  }
}

function renderView() {
  if (!containerEl) return;

  let filteredItems = filterAreaId ? items.filter(t => t.areaId === filterAreaId) : items;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(t => (t.title || '').toLowerCase().includes(q));
  }

  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="view-filter-bar">
        <div class="view-filter-group">
          <span style="color: var(--color-text-muted);">area</span>
          <select id="area-filter-select" class="inspector-select" style="width: auto; min-width: 80px; padding: 2px 4px; border: 1px solid var(--color-border);">
          </select>
        </div>
        <div id="view-search-portal"></div>
      </div>
      <div id="view-content-area"></div>
    </div>
  `;

  renderAreaFilter();

  const searchPortal = containerEl.querySelector('#view-search-portal');
  if (searchPortal) {
    searchPortal.appendChild(createSearchInput({
      value: searchQuery,
      onInput: handleSearch
    }));
  }

  const contentArea = document.getElementById('view-content-area');

  if (items.length === 0) {
    renderEmpty(contentArea);
  } else if (filteredItems.length === 0) {
    contentArea.innerHTML = `
      <div class="placeholder-view" style="height: auto; padding: var(--space-md) 0;">
        <p style="color: var(--color-text-muted);">${searchQuery ? 'No matching tasks found.' : 'No tasks match the selected Area filter.'}</p>
      </div>
    `;
  } else {
    renderArchiveList(contentArea, filteredItems);
  }
}

function renderAreaFilter() {
  const select = document.getElementById('area-filter-select');
  if (!select) return;

  const activeAreas = Repository.getAreas().filter(a => !a.archived);
  let html = `<option value="">all</option>`;
  activeAreas.forEach(a => {
    html += `<option value="${a.id}" ${filterAreaId === a.id ? 'selected' : ''}>${a.name}</option>`;
  });
  select.innerHTML = html;

  select.addEventListener('change', (e) => {
    filterAreaId = e.target.value;
    if (selectedItemId) {
      const task = items.find(t => t.id === selectedItemId);
      if (task && task.areaId !== filterAreaId && filterAreaId !== '') {
        setSelectedItemId(null);
      }
    }
    renderView();
  });
}

function renderEmpty(targetEl) {
  targetEl.innerHTML = `
    <div class="placeholder-view" style="height: auto; padding: var(--space-lg) 0;">
      <h2>archive</h2>
      <p>Archive is empty.</p>
      <p style="color: var(--color-text-muted); font-size: var(--font-size-xs); max-width: 320px; margin: var(--space-sm) 0 0 0; line-height: 1.4;">
        Finished work and discarded ideas will live here.
      </p>
    </div>
  `;
}

function renderArchiveList(targetEl, listItems) {
  targetEl.innerHTML = `
    <div class="completed-header" style="margin-bottom: var(--space-sm);">Permanent record</div>
    <div class="tasks-list-active" id="archive-items-list" role="listbox" aria-label="Archived items"></div>
  `;

  const listEl = document.getElementById('archive-items-list');
  listItems.forEach(item => {
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

  let filtered = filterAreaId ? items.filter(t => t.areaId === filterAreaId) : items;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => (t.title || '').toLowerCase().includes(q));
  }

  if (!selectedItemId) {
    if (event.key === 'ArrowDown' && filtered.length > 0) {
      event.preventDefault();
      setSelectedItemId(filtered[0].id);
      renderView();
    }
    return;
  }

  const idx = filtered.findIndex(i => i.id === selectedItemId);
  if (idx === -1) return;

  const currentItem = filtered[idx];

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (idx < filtered.length - 1) {
        setSelectedItemId(filtered[idx + 1].id);
        renderView();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (idx > 0) {
        setSelectedItemId(filtered[idx - 1].id);
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
