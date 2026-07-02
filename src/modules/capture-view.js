import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { crossfade, getRelativeTime } from '../ui/utils.js';

let containerEl = null;
let items = [];

/**
 * Mount the Capture view.
 */
export function renderCaptureView(container) {
  containerEl = container;
  items = Repository.getByModule('capture').sort((a, b) => b.createdAt - a.createdAt);

  renderView();

  // Reset and subscribe to event updates
  cleanupEventBus();
  EventBus.on('itemCreated', handleItemChange);
  EventBus.on('itemUpdated', handleItemChange);
  EventBus.on('itemDeleted', handleItemChange);

  // Monitor element removal to cleanup event handlers
  const observer = new MutationObserver(() => {
    if (!document.body.contains(containerEl)) {
      cleanupEventBus();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function handleItemChange() {
  items = Repository.getByModule('capture').sort((a, b) => b.createdAt - a.createdAt);
  renderView();
}

function cleanupEventBus() {
  EventBus.off('itemCreated', handleItemChange);
  EventBus.off('itemUpdated', handleItemChange);
  EventBus.off('itemDeleted', handleItemChange);
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
      <div class="tasks-list-active" id="capture-items-list" role="list"></div>
    </div>
  `;

  const listEl = document.getElementById('capture-items-list');
  items.forEach(item => {
    listEl.appendChild(buildCaptureRow(item));
  });
}

function buildCaptureRow(item) {
  const row = document.createElement('div');
  row.className = 'task-item'; // Reuse same list row styling
  row.setAttribute('data-id', item.id);

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
  focusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moveToFocus(item.id);
  });

  const parkBtn = document.createElement('button');
  parkBtn.className = 'action-btn';
  parkBtn.textContent = 'park';
  parkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    parkItem(item.id);
  });

  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'action-btn';
  archiveBtn.textContent = 'archive';
  archiveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    archiveItem(item.id);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.textContent = 'del';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(item.id);
  });

  actions.appendChild(focusBtn);
  actions.appendChild(parkBtn);
  actions.appendChild(archiveBtn);
  actions.appendChild(delBtn);
  row.appendChild(actions);

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
  ToastService.show('Moved to Focus.', 'success');
}

function parkItem(itemId) {
  Repository.move(itemId, 'parking-lot');
  ToastService.show('Parked.', 'success');
}

function archiveItem(itemId) {
  Repository.move(itemId, 'archive');
  ToastService.show('Archived.', 'success');
}

function deleteItem(itemId) {
  Repository.remove(itemId);
  ToastService.show('Deleted.', 'info');
}
