import { navigateTo } from './view-manager.js';
import { StorageService } from './storage.js';
import { CommandRegistry } from './command-registry.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';

// Icons
const TARGET_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
const INBOX_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`;
const LAYERS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>`;
const COFFEE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
const ARCHIVE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`;
const SETTINGS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
const CHECKBOX_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`;
const CHECKED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

// Register core default commands on initialization
CommandRegistry.register({ id: 'nav-focus', label: 'Go to Focus', category: 'Navigation', action: () => navigateTo('focus'), shortcut: '⌥1', icon: TARGET_ICON });
CommandRegistry.register({ id: 'nav-capture', label: 'Go to Capture', category: 'Navigation', action: () => navigateTo('capture'), shortcut: '⌥2', icon: INBOX_ICON });
CommandRegistry.register({ id: 'nav-areas', label: 'Go to Areas', category: 'Navigation', action: () => navigateTo('areas'), shortcut: '⌥3', icon: LAYERS_ICON });
CommandRegistry.register({ id: 'nav-parking-lot', label: 'Go to Parking Lot', category: 'Navigation', action: () => navigateTo('parking-lot'), shortcut: '⌥4', icon: COFFEE_ICON });
CommandRegistry.register({ id: 'nav-archive', label: 'Go to Archive', category: 'Navigation', action: () => navigateTo('archive'), shortcut: '⌥5', icon: ARCHIVE_ICON });
CommandRegistry.register({ id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', action: () => navigateTo('settings'), shortcut: '⌥6', icon: SETTINGS_ICON });
CommandRegistry.register({ id: 'action-start-fresh', label: 'Start fresh (Clear Completed Focus Tasks)', category: 'Actions', action: triggerStartFresh, icon: CHECKED_ICON });
CommandRegistry.register({ id: 'action-clear-workspace', label: 'Clear Workspace (Wipe Database)', category: 'Actions', action: triggerClearWorkspace, icon: TRASH_ICON });

// Internal state
let isOpen = false;
let backdropEl = null;
let selectedIndex = 0;
let visibleItems = [];

export const CommandPalette = {
  /**
   * Toggle opening and closing of the palette
   */
  toggle() {
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open the command palette modal overlay
   */
  open() {
    if (isOpen) return;
    
    const portal = document.getElementById('overlay-portal');
    if (!portal) return;

    isOpen = true;
    selectedIndex = 0;

    // Create modal structures
    backdropEl = document.createElement('div');
    backdropEl.className = 'modal-backdrop';

    const palette = document.createElement('div');
    palette.className = 'command-palette';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'command-palette-input';
    input.placeholder = 'Search commands or focus tasks...';
    input.autocomplete = 'off';

    const results = document.createElement('div');
    results.className = 'command-palette-results';

    palette.appendChild(input);
    palette.appendChild(results);
    backdropEl.appendChild(palette);
    portal.appendChild(backdropEl);

    // Fade transitions
    requestAnimationFrame(() => {
      backdropEl.classList.add('fade-in');
      input.focus();
    });

    // Event Bindings
    input.addEventListener('input', (e) => handleSearchInput(e.target.value));
    input.addEventListener('keydown', handleKeyNavigation);
    backdropEl.addEventListener('click', (e) => {
      if (e.target === backdropEl) this.close();
    });

    // Initial draw
    updateResults('');
  },

  /**
   * Dismiss the command palette
   */
  close() {
    if (!isOpen || !backdropEl) return;

    backdropEl.classList.remove('fade-in');
    isOpen = false;

    setTimeout(() => {
      const portal = document.getElementById('overlay-portal');
      if (portal && portal.contains(backdropEl)) {
        portal.removeChild(backdropEl);
      }
      backdropEl = null;
    }, 150);
  }
};

/**
 * Filter items based on query.
 */
function updateResults(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const tasks = StorageService.load();
  const registeredCommands = CommandRegistry.getAll();

  const filteredCommands = registeredCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(normalizedQuery)
  );

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(normalizedQuery)
  );

  visibleItems = [];

  // Group commands
  if (filteredCommands.length > 0) {
    visibleItems.push({ type: 'header', label: 'Commands' });
    filteredCommands.forEach(cmd => {
      visibleItems.push({ type: 'command', ...cmd });
    });
  }

  // Group tasks
  if (filteredTasks.length > 0) {
    visibleItems.push({ type: 'header', label: 'Focus Tasks' });
    filteredTasks.forEach(task => {
      visibleItems.push({
        type: 'task',
        label: task.title,
        icon: task.completed ? CHECKED_ICON : CHECKBOX_ICON,
        action: () => triggerSelectTask(task.id)
      });
    });
  }

  // Cap selection index
  const selectablesCount = visibleItems.filter(item => item.type !== 'header').length;
  if (selectedIndex >= selectablesCount) {
    selectedIndex = Math.max(0, selectablesCount - 1);
  }

  renderList();
}

/**
 * Render the filtered item rows in DOM.
 */
function renderList() {
  const resultsContainer = backdropEl.querySelector('.command-palette-results');
  resultsContainer.innerHTML = '';

  if (visibleItems.length === 0) {
    resultsContainer.innerHTML = `<div class="command-palette-empty">No results found</div>`;
    return;
  }

  let selectableIdx = 0;

  visibleItems.forEach((item) => {
    if (item.type === 'header') {
      const header = document.createElement('div');
      header.className = 'command-palette-group-title';
      header.textContent = item.label;
      resultsContainer.appendChild(header);
      return;
    }

    const row = document.createElement('div');
    row.className = 'command-palette-item';
    if (selectableIdx === selectedIndex) {
      row.classList.add('selected');
    }

    row.innerHTML = `
      ${item.icon || ''}
      <span>${escapeHtml(item.label)}</span>
      ${item.shortcut ? `<span class="command-palette-item-shortcut">${item.shortcut}</span>` : ''}
    `;

    // Map selection index for pointer hover override
    const currentIdx = selectableIdx;
    row.addEventListener('mousemove', () => {
      if (selectedIndex !== currentIdx) {
        selectedIndex = currentIdx;
        const selected = resultsContainer.querySelector('.command-palette-item.selected');
        if (selected) selected.classList.remove('selected');
        row.classList.add('selected');
      }
    });

    row.addEventListener('click', () => {
      executeItem(item);
    });

    resultsContainer.appendChild(row);
    selectableIdx++;
  });

  const activeRow = resultsContainer.querySelector('.command-palette-item.selected');
  if (activeRow) {
    activeRow.scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Update query on typing.
 */
function handleSearchInput(value) {
  updateResults(value);
}

/**
 * Handle Arrow Keys and Enter selection.
 */
function handleKeyNavigation(event) {
  const selectables = visibleItems.filter(item => item.type !== 'header');
  if (selectables.length === 0) {
    if (event.key === 'Escape') {
      event.preventDefault();
      CommandPalette.close();
    }
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex = (selectedIndex + 1) % selectables.length;
    renderList();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex = (selectedIndex - 1 + selectables.length) % selectables.length;
    renderList();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const item = selectables[selectedIndex];
    if (item) executeItem(item);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    CommandPalette.close();
  }
}

/**
 * Trigger the selected item's action.
 */
function executeItem(item) {
  CommandPalette.close();
  if (item.action) {
    item.action();
  }
}

/**
 * Action: Clear workspace confirmed trigger
 */
function triggerClearWorkspace() {
  DialogService.confirm({
    title: 'Wipe Database',
    message: 'This will permanently delete all tasks in Focus. This action cannot be undone.',
    confirmText: 'Clear Database',
    cancelText: 'Cancel',
    variant: 'danger'
  }).then((confirmed) => {
    if (confirmed) {
      StorageService.clear();
      ToastService.show('Workspace database wiped successfully.', 'success');
      
      const activeContainer = document.getElementById('active-view');
      const activeTitle = document.getElementById('view-title');
      if (activeTitle && activeTitle.textContent === 'Focus' && activeContainer) {
        import('../modules/focus-view.js').then((module) => {
          module.renderFocusView(activeContainer);
        });
      }
    }
  });
}

/**
 * Action: Clear completed tasks trigger
 */
function triggerStartFresh() {
  const tasks = StorageService.load();
  const completedCount = tasks.filter(t => t.completed).length;

  if (completedCount === 0) {
    ToastService.show('No completed tasks to clear.', 'info');
    return;
  }

  const activeTasks = tasks.filter(t => !t.completed);
  StorageService.save(activeTasks);
  ToastService.show(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}.`, 'success');

  const activeContainer = document.getElementById('active-view');
  const activeTitle = document.getElementById('view-title');
  if (activeTitle && activeTitle.textContent === 'Focus' && activeContainer) {
    import('../modules/focus-view.js').then((module) => {
      module.renderFocusView(activeContainer);
    });
  }
}

/**
 * Action: Navigate and select a specific task
 */
function triggerSelectTask(taskId) {
  import('../modules/focus-view.js').then((module) => {
    module.focusAndSelectTask(taskId);
  });
}

/**
 * XSS Helper.
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
