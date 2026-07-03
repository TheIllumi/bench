import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { renderEmptyState } from '../ui/empty-state.js';
import { createButton } from '../ui/button.js';
import { createInput } from '../ui/input.js';
import { createCheckbox } from '../ui/checkbox.js';
import { crossfade } from '../ui/utils.js';

let tasks = [];
let editingTaskId = null;
let selectedTaskId = null;
let containerEl = null;
let isCreating = false;

const GRIP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
const EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

/**
 * Mount the Focus view into the given container.
 */
export function renderFocusView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'focus-view';
  container.appendChild(containerEl);

  tasks = Repository.getByModule('focus');

  if (!selectedTaskId) editingTaskId = null;

  renderView();

  // Reset EventBus listeners to prevent duplicate registration
  cleanupEventBus();
  
  // Register EventBus listeners for reactive rendering
  EventBus.on('itemCreated', handleItemChange);
  EventBus.on('itemUpdated', handleItemChange);
  EventBus.on('itemDeleted', handleItemChange);
  EventBus.on('itemMoved', handleItemChange);
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

/**
 * Navigate to a specific task and open it for editing.
 * Called by the Command Palette search.
 */
export function focusAndSelectTask(taskId) {
  setSelectedTaskId(taskId);
  editingTaskId = taskId;
  const activeContainer = document.getElementById('active-view');
  if (activeContainer) renderFocusView(activeContainer);
}

// --- Event Handlers & Cleanup ---

function setSelectedTaskId(id) {
  selectedTaskId = id;
  if (id) {
    const task = tasks.find(t => t.id === id) || Repository.getAll().find(t => t.id === id);
    EventBus.emit('itemSelected', task || null);
  } else {
    EventBus.emit('itemSelected', null);
  }
}

function handleItemChange() {
  tasks = Repository.getByModule('focus');
  renderView();
}

function cleanupEventBus() {
  EventBus.off('itemCreated', handleItemChange);
  EventBus.off('itemUpdated', handleItemChange);
  EventBus.off('itemDeleted', handleItemChange);
  EventBus.off('itemMoved', handleItemChange);
  EventBus.off('areaCreated', handleItemChange);
  EventBus.off('areaUpdated', handleItemChange);
  EventBus.off('areaDeleted', handleItemChange);
}

function cleanupListeners() {
  cleanupEventBus();
  window.removeEventListener('keydown', handleGlobalKeydown);
  setSelectedTaskId(null);
}

// --- Rendering ---

function renderView() {
  if (!containerEl) return;

  const active = tasks.filter(t => t.status === 'active');
  const completed = tasks.filter(t => t.status === 'completed');

  if (tasks.length === 0 && !isCreating) {
    crossfade(containerEl, () => renderEmpty());
  } else if (active.length === 0 && tasks.length > 0 && !isCreating) {
    crossfade(containerEl, () => renderAllComplete());
  } else {
    crossfade(containerEl, () => renderTaskList(active, completed));
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>focus</h2>
      <p>No active tasks.</p>
      <p style="color: var(--color-text-muted); margin-top: var(--space-xs);">Press <span style="color: var(--color-accent-blue)">A</span> to create one.</p>
    </div>
  `;
}

function renderAllComplete() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>nice work.</h2>
      <p>Everything in Focus is complete.</p>
      <p style="color: var(--color-text-muted); margin-top: var(--space-xs);">Press <span style="color: var(--color-accent-blue)">R</span> to start fresh.</p>
    </div>
  `;
}

function renderTaskList(active, completed) {
  const atLimit = active.length >= 3;
  const showInput = !atLimit || isCreating;

  containerEl.innerHTML = `
    <div class="focus-container">
      ${atLimit ? `<div class="focus-limit-banner" role="status">You\u2019re focusing on enough already. Complete something before adding more.</div>` : ''}
      ${showInput ? `<div id="task-input-portal" class="task-input-container"></div>` : ''}
      <div class="tasks-list-active" id="active-tasks-list" role="listbox" aria-label="Active focus tasks"></div>
      ${completed.length > 0 ? `
        <div class="completed-header">Completed</div>
        <div class="tasks-list-completed" id="completed-tasks-list" role="list" aria-label="Completed tasks"></div>
      ` : ''}
    </div>
  `;

  // Input
  if (showInput) {
    const portal = document.getElementById('task-input-portal');
    const input = createInput({
      placeholder: 'Add a focus task\u2026',
      onKeyDown: handleCreateKeyDown,
      id: 'new-task-input'
    });
    input.setAttribute('aria-label', 'Create a new focus task');
    portal.appendChild(input);

    if (!selectedTaskId || isCreating) {
      requestAnimationFrame(() => input.focus());
    }
  }

  // Active tasks
  const activeList = document.getElementById('active-tasks-list');
  active.forEach(task => activeList.appendChild(buildTaskRow(task)));

  // Completed tasks
  const completedList = document.getElementById('completed-tasks-list');
  if (completedList) {
    completed.forEach(task => completedList.appendChild(buildTaskRow(task)));
  }

  // Restore keyboard focus to selected task after re-render
  if (selectedTaskId && !editingTaskId && !isCreating) {
    const el = activeList.querySelector(`[data-id="${selectedTaskId}"]`);
    if (el) requestAnimationFrame(() => el.focus());
  }
}

// --- Task Row Builder ---

function buildTaskRow(task) {
  const row = document.createElement('div');
  row.className = 'task-item';
  row.setAttribute('data-id', task.id);

  const isCompleted = task.status === 'completed';

  if (isCompleted) {
    row.classList.add('completed');
    row.setAttribute('role', 'listitem');
    row.setAttribute('tabindex', '-1');
  } else {
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', task.id === selectedTaskId ? 'true' : 'false');
    row.setAttribute('tabindex', '0');
    if (task.id === selectedTaskId) row.classList.add('selected');
  }

  const isEditing = task.id === editingTaskId && !isCompleted;

  // Drag handle (active tasks only)
  if (!isCompleted) {
    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.innerHTML = GRIP_ICON;
    handle.addEventListener('pointerdown', (e) => startDrag(e, row));
    row.appendChild(handle);
  }

  // Checkbox
  row.appendChild(createCheckbox({
    checked: isCompleted,
    onChange: () => toggleCompletion(task.id)
  }));

  // Title or edit input
  if (isEditing) {
    const input = createInput({
      value: task.title,
      onKeyDown: (e) => handleEditKeyDown(e, task.id),
      onBlur: (e) => commitEdit(task.id, e.target.value),
      className: 'task-edit-input'
    });
    input.setAttribute('aria-label', 'Edit task title');
    row.appendChild(input);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  } else {
    const area = task.areaId ? Repository.getAreas().find(a => a.id === task.areaId) : null;
    const title = document.createElement('span');
    title.className = 'task-title';
    if (area) {
      const areaLabel = document.createElement('span');
      areaLabel.className = 'task-area-label';
      areaLabel.textContent = `[${area.name}] `;
      title.appendChild(areaLabel);
    }
    const textNode = document.createTextNode(task.title);
    title.appendChild(textNode);
    row.appendChild(title);
  }

  // Hover actions (TUI style text actions)
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  if (!isCompleted && !isEditing) {
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.setAttribute('tabindex', '-1');
    editBtn.textContent = 'edit';
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); startEditing(task.id); });
    actions.appendChild(editBtn);

    const assignBtn = document.createElement('button');
    assignBtn.className = 'action-btn';
    assignBtn.setAttribute('aria-label', 'Assign Area');
    assignBtn.setAttribute('tabindex', '-1');
    assignBtn.textContent = 'area';
    assignBtn.addEventListener('click', (e) => { e.stopPropagation(); openAreaPicker(e, task); });
    actions.appendChild(assignBtn);

    const parkBtn = document.createElement('button');
    parkBtn.className = 'action-btn';
    parkBtn.setAttribute('aria-label', 'Park task');
    parkBtn.setAttribute('tabindex', '-1');
    parkBtn.textContent = 'park';
    parkBtn.addEventListener('click', (e) => { e.stopPropagation(); parkTask(task.id); });
    actions.appendChild(parkBtn);
  }

  if (!isEditing) {
    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'action-btn';
    archiveBtn.setAttribute('aria-label', 'Archive task');
    archiveBtn.setAttribute('tabindex', '-1');
    archiveBtn.textContent = 'archive';
    archiveBtn.addEventListener('click', (e) => { e.stopPropagation(); archiveTask(task.id); });
    actions.appendChild(archiveBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.setAttribute('tabindex', '-1');
  delBtn.textContent = 'del';
  delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTask(task.id); });
  actions.appendChild(delBtn);
  row.appendChild(actions);

  // Click to select (active, non-editing only)
  if (!isCompleted && !isEditing) {
    row.addEventListener('click', () => {
      setSelectedTaskId(task.id);
      isCreating = false;
      renderView();
    });
  }

  return row;
}

// --- Task Operations ---

function handleCreateKeyDown(event) {
  if (event.key === 'Enter') {
    const title = event.target.value.trim();
    if (!title) return;

    Repository.save({
      title,
      status: 'active',
      module: 'focus'
    });
    event.target.value = '';
    isCreating = false;
  } else if (event.key === 'Escape') {
    isCreating = false;
    renderView();
  }
}

function toggleCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const nextStatus = task.status === 'completed' ? 'active' : 'completed';
  if (nextStatus === 'completed' && selectedTaskId === taskId) {
    setSelectedTaskId(null);
  }
  
  Repository.update(taskId, { status: nextStatus });
  ToastService.show(nextStatus === 'completed' ? 'Task completed.' : 'Task reopened.', nextStatus === 'completed' ? 'success' : 'info');
}

function startEditing(taskId) {
  editingTaskId = taskId;
  setSelectedTaskId(taskId);
  isCreating = false;
  renderView();
}

function handleEditKeyDown(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitEdit(taskId, event.target.value);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    editingTaskId = null;
    setSelectedTaskId(null);
    renderView();
  }
}

function commitEdit(taskId, newTitle) {
  const task = tasks.find(t => t.id === taskId);
  const title = newTitle.trim();

  if (task && title && task.title !== title) {
    Repository.update(taskId, { title });
  }

  editingTaskId = null;
  setSelectedTaskId(null);
  renderView();
}

function deleteTask(taskId) {
  const allItems = Repository.getAll();
  const deletedTask = allItems.find(t => t.id === taskId);
  if (!deletedTask) return;
  
  const deletedIndex = allItems.indexOf(deletedTask);

  Repository.remove(taskId);
  
  if (selectedTaskId === taskId) setSelectedTaskId(null);
  if (editingTaskId === taskId) editingTaskId = null;

  ToastService.show('Task removed.', 'info', 5000, {
    label: 'Undo',
    callback: () => {
      Repository.save(deletedTask, deletedIndex);
    }
  });
}

function parkTask(taskId) {
  Repository.move(taskId, 'parking-lot');
  if (selectedTaskId === taskId) setSelectedTaskId(null);
  ToastService.show('Parked.', 'success');
}

function archiveTask(taskId) {
  Repository.move(taskId, 'archive');
  if (selectedTaskId === taskId) setSelectedTaskId(null);
  ToastService.show('Archived.', 'success');
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

  const active = tasks.filter(t => t.status === 'active');

  // Global Keys (when not typing)
  if (event.key.toLowerCase() === 'a') {
    if (active.length < 3) {
      event.preventDefault();
      isCreating = true;
      setSelectedTaskId(null);
      renderView();
    } else {
      ToastService.show("Focus is full. Complete a task first.", "info");
    }
    return;
  }

  // Clear workspace (R key on completed view)
  if (event.key.toLowerCase() === 'r') {
    if (active.length === 0 && tasks.length > 0) {
      event.preventDefault();
      Repository.clearModule('focus');
      isCreating = false;
      ToastService.show('Focus cleared.', 'info');
    }
    return;
  }

  if (!selectedTaskId || editingTaskId) {
    // If no task selected, pressing ArrowDown selects first active task
    if (event.key === 'ArrowDown' && active.length > 0) {
      event.preventDefault();
      setSelectedTaskId(active[0].id);
      renderView();
    }
    return;
  }

  const idx = active.findIndex(t => t.id === selectedTaskId);
  if (idx === -1) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (idx < active.length - 1) {
        setSelectedTaskId(active[idx + 1].id);
        renderView();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (idx > 0) {
        setSelectedTaskId(active[idx - 1].id);
        renderView();
      } else {
        setSelectedTaskId(null);
        renderView();
      }
      break;
    case 'Enter':
    case 'e':
    case 'E':
      event.preventDefault();
      startEditing(selectedTaskId);
      break;
    case 'Escape':
      event.preventDefault();
      setSelectedTaskId(null);
      renderView();
      break;
    case ' ':
      event.preventDefault();
      toggleCompletion(selectedTaskId);
      break;
    case 'Delete':
    case 'Backspace':
    case 'd':
    case 'D':
    case 'x':
    case 'X':
      event.preventDefault();
      deleteTask(selectedTaskId);
      break;
  }
}

// --- Pointer Drag-and-Drop with Ghost Preview ---

let dragEl = null;
let ghostEl = null;

function startDrag(event, row) {
  const handle = event.target;
  handle.setPointerCapture(event.pointerId);
  dragEl = row;
  dragEl.classList.add('dragging');

  // Create floating ghost preview
  ghostEl = row.cloneNode(true);
  ghostEl.className = 'task-item drag-ghost';
  ghostEl.style.width = row.offsetWidth + 'px';
  ghostEl.style.left = row.getBoundingClientRect().left + 'px';
  ghostEl.style.top = event.clientY - row.offsetHeight / 2 + 'px';
  document.body.appendChild(ghostEl);

  function onMove(e) {
    if (!dragEl) return;
    e.preventDefault();

    if (ghostEl) {
      ghostEl.style.top = e.clientY - ghostEl.offsetHeight / 2 + 'px';
    }

    const list = document.getElementById('active-tasks-list');
    if (!list) return;

    const siblings = [...list.querySelectorAll('.task-item:not(.dragging)')];
    const target = siblings.find(s => {
      const rect = s.getBoundingClientRect();
      return e.clientY <= rect.top + rect.height / 2;
    });

    if (target) {
      list.insertBefore(dragEl, target);
    } else {
      list.appendChild(dragEl);
    }
  }

  function onUp(e) {
    handle.releasePointerCapture(e.pointerId);
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);

    if (ghostEl && ghostEl.parentNode) {
      ghostEl.parentNode.removeChild(ghostEl);
      ghostEl = null;
    }

    if (!dragEl) return;
    dragEl.classList.remove('dragging');

    const list = document.getElementById('active-tasks-list');
    const ids = [...list.querySelectorAll('.task-item')].map(el => el.dataset.id);
    
    Repository.reorder('focus', ids);
    dragEl = null;
  }

  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
}

/**
 * Open floating Area picker dropdown next to active task element.
 */
function openAreaPicker(e, task) {
  e.stopPropagation();

  // Remove existing dropdowns
  const existing = document.querySelector('.area-picker-dropdown');
  if (existing) existing.remove();

  const rect = e.target.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.className = 'area-picker-dropdown';
  
  // Align picker below the action button
  picker.style.top = `${rect.bottom + window.scrollY}px`;
  picker.style.left = `${rect.left + window.scrollX}px`;

  const areasList = Repository.getAreas();

  if (areasList.length === 0) {
    const disabledItem = document.createElement('div');
    disabledItem.className = 'area-picker-item disabled';
    disabledItem.textContent = 'No Areas created';
    picker.appendChild(disabledItem);
  } else {
    // [None] selection to un-assign the area
    const noneItem = document.createElement('div');
    noneItem.className = 'area-picker-item';
    noneItem.textContent = '[None]';
    noneItem.addEventListener('click', () => {
      Repository.update(task.id, { areaId: null });
      picker.remove();
    });
    picker.appendChild(noneItem);

    areasList.forEach(area => {
      const item = document.createElement('div');
      item.className = 'area-picker-item';
      item.textContent = `[${area.name}]`;
      if (task.areaId === area.id) {
        item.classList.add('active');
      }
      item.addEventListener('click', () => {
        Repository.update(task.id, { areaId: area.id });
        picker.remove();
      });
      picker.appendChild(item);
    });
  }

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
