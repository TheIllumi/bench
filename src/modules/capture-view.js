import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';
import { createSearchInput } from '../ui/search.js';
import { openAreaPicker } from '../ui/area-picker.js';
import { QuickCapture } from '../core/quick-capture.js';
import { createCheckbox } from '../ui/checkbox.js';

let containerEl = null;
let items = [];
let selectedItemId = null;
let filterAreaId = '';
let searchQuery = '';

export function renderCaptureView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'capture-view';
  container.appendChild(containerEl);

  items = Repository.getByModule('capture').sort((a, b) => b.createdAt - a.createdAt);
  searchQuery = '';

  if (selectedItemId && !items.find(i => i.id === selectedItemId)) {
    setSelectedItemId(null);
  }

  renderView();

  // Reset and subscribe to event updates
  cleanupEventBus();
  EventBus.on('itemCreated', handleItemChange);
  EventBus.on('itemUpdated', handleItemChange);
  EventBus.on('itemDeleted', handleItemChange);
  EventBus.on('areaCreated', handleItemChange);
  EventBus.on('areaUpdated', handleItemChange);
  EventBus.on('areaDeleted', handleItemChange);

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

function handleItemChange() {
  items = Repository.getByModule('capture').sort((a, b) => b.createdAt - a.createdAt);
  if (filterAreaId && !Repository.getAreas().find(a => a.id === filterAreaId && !a.archived)) {
    filterAreaId = '';
  }
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
  EventBus.off('areaCreated', handleItemChange);
  EventBus.off('areaUpdated', handleItemChange);
  EventBus.off('areaDeleted', handleItemChange);
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
    renderCaptureList(contentArea, filteredItems);
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
        <button id="add-capture-btn-list" class="action-btn" style="text-decoration:none;" title="New Capture (C)">+ New Capture</button>
      </div>
      <div id="view-content-area"></div>
    </div>
  `;

  renderAreaFilter();

  const addBtn = containerEl.querySelector('#add-capture-btn-list');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      QuickCapture.open(filterAreaId || undefined);
    });
  }

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
    renderCaptureList(contentArea, filteredItems);
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
      <h2>capture</h2>
      <p>No captured thoughts.</p>
      <p style="color: var(--color-text-muted); margin-top: var(--space-xs);">Press <span style="color: var(--color-accent-blue)">C</span> to capture an idea.</p>
    </div>
  `;
}

function renderCaptureList(targetEl, listItems) {
  targetEl.innerHTML = `
    <div class="tasks-list-active" id="capture-items-list" role="listbox" tabindex="-1"></div>
  `;

  const listEl = document.getElementById('capture-items-list');
  listItems.forEach(item => {
    listEl.appendChild(buildCaptureRow(item));
  });

  // Restore focus if an item was selected (only if user is not editing in the Inspector)
  if (selectedItemId) {
    const activeEl = document.activeElement;
    const isEditingInInspector = activeEl && activeEl.closest('#inspector-panel');
    if (!isEditingInInspector) {
      const selectedEl = listEl.querySelector(`[data-id="${selectedItemId}"]`);
      if (selectedEl) selectedEl.focus();
    }
  }
}

function buildCaptureRow(item) {
  const row = document.createElement('div');
  row.className = 'task-item'; // Reuse same list row styling
  row.setAttribute('data-id', item.id);
  row.setAttribute('role', 'option');
  row.setAttribute('tabindex', '0');

  const isCompleted = item.status === 'completed';
  const isFocused = item.focused && item.status === 'active';

  if (selectedItemId === item.id) {
    row.classList.add('selected');
    row.setAttribute('aria-selected', 'true');
  }

  if (isCompleted) {
    row.classList.add('completed');
  }

  if (isFocused) {
    row.classList.add('focused');
  }

  // Checkbox
  row.appendChild(createCheckbox({
    checked: isCompleted,
    onChange: () => toggleCompletion(item.id)
  }));

  // Left Title
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

  // Middle Relative Time
  const timeBadge = document.createElement('span');
  timeBadge.className = 'capture-time-badge';
  timeBadge.textContent = getRelativeTime(item.createdAt);
  row.appendChild(timeBadge);

  // Right Actions (TUI plain text actions)
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const focusBtn = document.createElement('button');
  focusBtn.className = 'action-btn';
  if (item.focused && item.status === 'active') {
    focusBtn.classList.add('active');
  }
  focusBtn.textContent = 'focus';
  focusBtn.setAttribute('tabindex', '-1');
  focusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFocus(item.id);
  });

  const assignBtn = document.createElement('button');
  assignBtn.className = 'action-btn';
  assignBtn.textContent = 'area';
  assignBtn.setAttribute('aria-label', 'Assign Area');
  assignBtn.setAttribute('tabindex', '-1');
  assignBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openAreaPicker(e, item, (areaId) => {
      Repository.update(item.id, { areaId });
    });
  });

  const parkBtn = document.createElement('button');
  parkBtn.className = 'action-btn';
  parkBtn.textContent = 'park';
  parkBtn.setAttribute('tabindex', '-1');
  parkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    parkItem(item.id);
  });

  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'action-btn';
  archiveBtn.textContent = 'archive';
  archiveBtn.setAttribute('tabindex', '-1');
  archiveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    archiveItem(item.id);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn btn-danger';
  delBtn.textContent = 'del';
  delBtn.setAttribute('tabindex', '-1');
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(item.id);
  });

  actions.appendChild(focusBtn);
  actions.appendChild(assignBtn);
  actions.appendChild(parkBtn);
  actions.appendChild(archiveBtn);
  actions.appendChild(delBtn);
  row.appendChild(actions);

  row.addEventListener('click', () => {
    setSelectedItemId(item.id);
    renderView();
  });

  return row;
}

// --- Capture Operations ---
function toggleCompletion(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const nextStatus = item.status === 'completed' ? 'active' : 'completed';
  if (nextStatus === 'completed' && selectedItemId === itemId) {
    setSelectedItemId(null);
  }

  Repository.update(itemId, { status: nextStatus });
  ToastService.show(nextStatus === 'completed' ? 'Task completed.' : 'Task reopened.', nextStatus === 'completed' ? 'success' : 'info');
}

function toggleFocus(itemId) {
  const item = Repository.getAll().find(i => i.id === itemId);
  if (!item) return;

  if (item.focused) {
    Repository.update(itemId, { focused: false });
    ToastService.show('Removed from Focus.', 'info');
  } else {
    const activeFocus = Repository.getFocusedTasks().filter(t => t.status === 'active');
    if (activeFocus.length >= 3) {
      ToastService.show('Focus is full. Complete something first.', 'info');
      return;
    }
    Repository.update(itemId, { focused: true });
    ToastService.show('Added to Focus.', 'success');
  }
}

function parkItem(itemId) {
  Repository.move(itemId, 'parking-lot');
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Parked.', 'success');
}

function archiveItem(itemId) {
  Repository.move(itemId, 'archive');
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Archived.', 'success');
}

function deleteItem(itemId) {
  Repository.remove(itemId);
  if (selectedItemId === itemId) setSelectedItemId(null);
  ToastService.show('Deleted.', 'info');
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
    case 'Escape':
      event.preventDefault();
      setSelectedItemId(null);
      renderView();
      break;
    case ' ':
      event.preventDefault();
      toggleCompletion(selectedItemId);
      break;
    case 'f':
    case 'F':
      event.preventDefault();
      toggleFocus(selectedItemId);
      break;
    case 'p':
    case 'P':
      event.preventDefault();
      parkItem(selectedItemId);
      break;
    case 'a':
    case 'A':
      event.preventDefault();
      archiveItem(selectedItemId);
      break;
    case 'd':
    case 'D':
    case 'Delete':
    case 'Backspace':
      event.preventDefault();
      deleteItem(selectedItemId);
      break;
  }
}

/**
 * Focus and highlight a specific captured item.
 * Called by the Command Palette.
 */
export function focusAndSelectCaptureTask(itemId) {
  setSelectedItemId(itemId);
  const activeContainer = document.getElementById('active-view');
  if (activeContainer) renderCaptureView(activeContainer);
}
