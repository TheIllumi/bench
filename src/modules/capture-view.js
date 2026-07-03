import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';

let containerEl = null;
let items = [];
let selectedItemId = null;

export function renderCaptureView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'capture-view';
  container.appendChild(containerEl);

  items = Repository.getByModule('capture').sort((a, b) => b.createdAt - a.createdAt);

  if (selectedItemId && !items.find(i => i.id === selectedItemId)) {
    setSelectedItemId(null);
  }

  renderView();

  // Reset and subscribe to event updates
  cleanupEventBus();
  EventBus.on('itemCreated', handleItemChange);
  EventBus.on('itemUpdated', handleItemChange);
  EventBus.on('itemDeleted', handleItemChange);

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
    crossfade(containerEl, () => renderCaptureList());
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>capture</h2>
      <p>No captured thoughts.</p>
      <p style="color: var(--color-text-muted); margin-top: var(--space-xs);">Press <span style="color: var(--color-accent-blue)">C</span> to capture an idea.</p>
    </div>
  `;
}

function renderCaptureList() {
  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="tasks-list-active" id="capture-items-list" role="listbox" tabindex="-1"></div>
    </div>
  `;

  const listEl = document.getElementById('capture-items-list');
  items.forEach(item => {
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

  if (selectedItemId === item.id) {
    row.classList.add('selected');
    row.setAttribute('aria-selected', 'true');
  }

  // Left Title
  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = item.title;
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
  focusBtn.textContent = 'focus';
  focusBtn.setAttribute('tabindex', '-1');
  focusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moveToFocus(item.id);
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
  delBtn.className = 'action-btn';
  delBtn.textContent = 'del';
  delBtn.setAttribute('tabindex', '-1');
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(item.id);
  });

  actions.appendChild(focusBtn);
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
    case 'Escape':
      event.preventDefault();
      setSelectedItemId(null);
      renderView();
      break;
    case 'f':
    case 'F':
      event.preventDefault();
      moveToFocus(selectedItemId);
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
