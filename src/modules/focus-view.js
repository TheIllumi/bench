import { StorageService } from '../core/storage.js';

// Module level state
let tasks = [];
let isCreating = false;
let editingTaskId = null;
let selectedTaskId = null;
let containerEl = null;

// Icons (Lucide SVGs embedded inline)
const GRIP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drag-handle"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

/**
 * Entry point to render and control the Focus module view.
 * @param {HTMLElement} container - Active view container element
 */
export function renderFocusView(container) {
  containerEl = container;
  tasks = StorageService.load();
  editingTaskId = null;
  selectedTaskId = null;

  renderView();

  // Bind global keyboard event handler for selection shortcuts
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('keydown', handleGlobalKeydown);
}

/**
 * Main render function redrawing the DOM based on state.
 */
function renderView() {
  if (!containerEl) return;

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // 1. Core Empty State
  if (tasks.length === 0 && !isCreating) {
    renderEmptyStateScreen();
    return;
  }

  // 2. "Start Fresh" Completed State
  if (tasks.length > 0 && activeTasks.length === 0) {
    renderStartFreshScreen();
    return;
  }

  // 3. Focus List View
  renderTaskListScreen(activeTasks, completedTasks);
}

/**
 * Screen: True Empty State
 */
function renderEmptyStateScreen() {
  containerEl.innerHTML = `
    <div id="focus-module-container" class="placeholder-view">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      <h2>Focus starts here.</h2>
      <p>Choose the three things that matter most today.</p>
      <button class="empty-action-btn" id="add-first-task-btn">Add your first task</button>
    </div>
  `;

  document.getElementById('add-first-task-btn').addEventListener('click', () => {
    isCreating = true;
    renderView();
  });
}

/**
 * Screen: Celebratory completed state
 */
function renderStartFreshScreen() {
  containerEl.innerHTML = `
    <div id="focus-module-container" class="placeholder-view">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue)"><path d="M20 6 9 17l-5-5"/></svg>
      <h2>Nice work.</h2>
      <p>Everything in Focus is complete.</p>
      <button class="primary-action-btn" id="start-fresh-btn">Start fresh</button>
    </div>
  `;

  document.getElementById('start-fresh-btn').addEventListener('click', () => {
    tasks = [];
    isCreating = false;
    StorageService.save(tasks);
    renderView();
  });
}

/**
 * Screen: Main interactive tasks lists
 */
function renderTaskListScreen(activeTasks, completedTasks) {
  const showWarningBanner = activeTasks.length >= 3;
  const showInput = activeTasks.length < 3;

  containerEl.innerHTML = `
    <div id="focus-module-container" class="focus-container">
      
      <!-- Focus Cap Warning Banner -->
      ${showWarningBanner ? `
        <div class="focus-limit-banner">
          You're focusing on enough already. Complete something before adding more.
        </div>
      ` : ''}

      <!-- Inline Task Input Field -->
      ${showInput ? `
        <div class="task-input-container">
          <input type="text" class="task-input" id="new-task-input" placeholder="Add a focus task..." autocomplete="off">
        </div>
      ` : ''}

      <!-- Active Tasks List -->
      <div class="tasks-list-active" id="active-tasks-list"></div>

      <!-- Completed Tasks List -->
      ${completedTasks.length > 0 ? `
        <div class="completed-header">Completed</div>
        <div class="tasks-list-completed" id="completed-tasks-list"></div>
      ` : ''}

    </div>
  `;

  // Focus and bind creation input if rendered
  if (showInput) {
    const inputEl = document.getElementById('new-task-input');
    inputEl.focus();
    inputEl.addEventListener('keydown', handleCreateTaskKeyDown);
  }

  // Populate active list
  const activeListEl = document.getElementById('active-tasks-list');
  activeTasks.forEach(task => {
    const taskItem = createTaskItemDOM(task);
    activeListEl.appendChild(taskItem);
  });

  // Populate completed list
  const completedListEl = document.getElementById('completed-tasks-list');
  if (completedListEl) {
    completedTasks.forEach(task => {
      const taskItem = createTaskItemDOM(task);
      completedListEl.appendChild(taskItem);
    });
  }
}

/**
 * Dynamic creation of a single task item DOM node with event bindings.
 */
function createTaskItemDOM(task) {
  const item = document.createElement('div');
  item.className = 'task-item';
  item.setAttribute('data-id', task.id);
  if (task.completed) item.classList.add('completed');
  if (task.id === selectedTaskId) item.classList.add('selected');

  const isEditing = task.id === editingTaskId && !task.completed;

  // Build internal markup
  item.innerHTML = `
    <!-- Drag Handle (Active items only) -->
    ${!task.completed ? `<div class="drag-handle">${GRIP_ICON}</div>` : ''}

    <!-- Custom Checkbox -->
    <button class="checkbox-btn ${task.completed ? 'checked' : ''}" aria-label="Toggle completion">
      ${CHECK_ICON}
    </button>

    <!-- Task Content Area -->
    ${isEditing ? `
      <input type="text" class="task-edit-input" value="${escapeHtml(task.title)}" autocomplete="off">
    ` : `
      <span class="task-title">${escapeHtml(task.title)}</span>
    `}

    <!-- Actions (Edit/Delete on Hover) -->
    <div class="task-actions">
      ${!task.completed ? `
        <button class="action-btn edit-action" aria-label="Edit task">${EDIT_ICON}</button>
      ` : ''}
      <button class="action-btn delete-action" aria-label="Delete task">${TRASH_ICON}</button>
    </div>
  `;

  // Bind Event Listeners
  
  // 1. Completion toggle
  const checkboxBtn = item.querySelector('.checkbox-btn');
  checkboxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  });

  // 2. Inline Edit triggers
  if (isEditing) {
    const editInput = item.querySelector('.task-edit-input');
    // Autofocus and select text
    setTimeout(() => {
      editInput.focus();
      editInput.select();
    }, 0);

    editInput.addEventListener('keydown', (e) => handleEditKeyDown(e, task.id));
    editInput.addEventListener('blur', (e) => saveTaskTitle(task.id, e.target.value));
  } else if (!task.completed) {
    // Edit icon click
    const editBtn = item.querySelector('.edit-action');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startEditing(task.id);
      });
    }
  }

  // 3. Deletion click
  const deleteBtn = item.querySelector('.delete-action');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  // 4. Selection click (Only active tasks can be selected)
  if (!task.completed && !isEditing) {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedTaskId = task.id;
      renderView();
    });
  }

  // 5. Pointer-Based Drag and Drop (Active items only)
  if (!task.completed) {
    const dragHandle = item.querySelector('.drag-handle');
    dragHandle.addEventListener('pointerdown', (e) => handleDragStart(e, item));
  }

  return item;
}

/**
 * Handle new task input key actions.
 */
function handleCreateTaskKeyDown(event) {
  if (event.key === 'Enter') {
    const value = event.target.value.trim();
    if (!value) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: value,
      completed: false
    };

    tasks.push(newTask);
    StorageService.save(tasks);
    
    // Clear input, keep focus if we can still add more, else close input
    event.target.value = '';
    const activeCount = tasks.filter(t => !t.completed).length;
    if (activeCount >= 3) {
      isCreating = false;
    }
    renderView();
  } else if (event.key === 'Escape') {
    isCreating = false;
    renderView();
  }
}

/**
 * Toggle task completion state.
 */
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    // Clear selection if completing
    if (task.completed && selectedTaskId === taskId) {
      selectedTaskId = null;
    }
    StorageService.save(tasks);
    renderView();
  }
}

/**
 * Transition task to edit mode.
 */
function startEditing(taskId) {
  editingTaskId = taskId;
  selectedTaskId = taskId;
  renderView();
}

/**
 * Handle edit input key actions.
 */
function handleEditKeyDown(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveTaskTitle(taskId, event.target.value);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    editingTaskId = null;
    renderView();
  }
}

/**
 * Persist revised task title.
 */
function saveTaskTitle(taskId, newTitle) {
  const task = tasks.find(t => t.id === taskId);
  const title = newTitle.trim();
  if (task && title) {
    task.title = title;
    StorageService.save(tasks);
  }
  editingTaskId = null;
  selectedTaskId = null;
  renderView();
}

/**
 * Remove task from collection.
 */
function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  if (selectedTaskId === taskId) selectedTaskId = null;
  if (editingTaskId === taskId) editingTaskId = null;
  StorageService.save(tasks);
  renderView();
}

/**
 * Handle keys globally when Focus view is active and task is selected.
 */
function handleSelectionKeydown(event) {
  if (!selectedTaskId || editingTaskId) return;

  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task || task.completed) return;

  if (event.key === 'Enter') {
    event.preventDefault();
    editingTaskId = selectedTaskId;
    renderView();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    selectedTaskId = null;
    renderView();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    deleteTask(selectedTaskId);
  } else if (event.key === ' ') {
    event.preventDefault();
    toggleTaskCompletion(selectedTaskId);
  }
}

/**
 * Clean cleanup when navigating out
 */
function handleGlobalKeydown(event) {
  if (!containerEl || !document.body.contains(containerEl)) {
    window.removeEventListener('keydown', handleGlobalKeydown);
    return;
  }
  handleSelectionKeydown(event);
}

/**
 * Custom Pointer-Based Drag and Drop Logic.
 */
let activeDragEl = null;

function handleDragStart(event, itemDOM) {
  // Capture pointer events on the handle
  event.target.setPointerCapture(event.pointerId);
  activeDragEl = itemDOM;
  activeDragEl.classList.add('dragging');

  // Register move and lift listeners dynamically
  const onPointerMove = (moveEvent) => {
    if (!activeDragEl) return;
    moveEvent.preventDefault();

    const container = document.getElementById('active-tasks-list');
    if (!container) return;

    const clientY = moveEvent.clientY;
    const siblings = [...container.querySelectorAll('.task-item:not(.dragging)')];

    // Identify matching insertion sibling based on cursor position
    const nextSibling = siblings.find(sibling => {
      const box = sibling.getBoundingClientRect();
      return clientY <= box.top + box.height / 2;
    });

    if (nextSibling) {
      container.insertBefore(activeDragEl, nextSibling);
    } else {
      container.appendChild(activeDragEl);
    }
  };

  const onPointerUp = (upEvent) => {
    upEvent.target.releasePointerCapture(upEvent.pointerId);
    
    if (activeDragEl) {
      activeDragEl.classList.remove('dragging');

      // Extract new list sequence from DOM order
      const container = document.getElementById('active-tasks-list');
      const reorderedIds = [...container.querySelectorAll('.task-item')].map(el => el.getAttribute('data-id'));

      // Reorder in-memory tasks array
      const activeTasks = tasks.filter(t => !t.completed);
      const completedTasks = tasks.filter(t => t.completed);
      const newActiveTasks = reorderedIds.map(id => activeTasks.find(t => t.id === id)).filter(Boolean);

      tasks = [...newActiveTasks, ...completedTasks];
      StorageService.save(tasks);
      
      activeDragEl = null;
      renderView(); // Clear DOM adjustments and perform fresh layout
    }

    event.target.removeEventListener('pointermove', onPointerMove);
    event.target.removeEventListener('pointerup', onPointerUp);
    event.target.removeEventListener('pointercancel', onPointerUp);
  };

  event.target.addEventListener('pointermove', onPointerMove);
  event.target.addEventListener('pointerup', onPointerUp);
  event.target.addEventListener('pointercancel', onPointerUp);
}

/**
 * Escapes HTML characters to prevent XSS.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
