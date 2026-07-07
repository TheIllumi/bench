import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';
import { createInput } from '../ui/input.js';
import { createCheckbox } from '../ui/checkbox.js';
import { crossfade } from '../ui/utils.js';

const FOLDER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="area-folder-icon" style="color: var(--color-text-muted); flex-shrink: 0; margin-top: 2px;"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>`;

let areas = [];
let selectedAreaId = null;
let selectedTaskId = null;
let editingAreaId = null;
let containerEl = null;
let isCreating = false;
let sortBy = 'updated';

function loadAndSortAreas() {
  const rawAreas = Repository.getAreas().filter(a => !a.archived);
  
  if (sortBy === 'alphabetical') {
    areas = rawAreas.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy === 'created') {
    areas = rawAreas.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortBy === 'active') {
    areas = rawAreas.sort((a, b) => {
      const allItems = Repository.getAll();
      const activeA = allItems.filter(item => item.type !== 'area' && item.areaId === a.id && (item.module === 'focus' || item.module === 'capture') && item.status !== 'completed').length;
      const activeB = allItems.filter(item => item.type !== 'area' && item.areaId === b.id && (item.module === 'focus' || item.module === 'capture') && item.status !== 'completed').length;
      if (activeA !== activeB) {
        return activeB - activeA;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  } else {
    areas = rawAreas.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

/**
 * Mount the Areas view.
 */
export function renderAreasView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'areas-view';
  container.appendChild(containerEl);

  loadAndSortAreas();

  if (!selectedAreaId) editingAreaId = null;

  renderView();

  cleanupEventBus();
  EventBus.on('areaCreated', handleAreaChange);
  EventBus.on('areaUpdated', handleAreaChange);
  EventBus.on('areaDeleted', handleAreaChange);
  EventBus.on('itemCreated', handleAreaChange);
  EventBus.on('itemUpdated', handleAreaChange);
  EventBus.on('itemDeleted', handleAreaChange);

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

export function focusAndSelectArea(areaId) {
  setSelectedAreaId(areaId);
  editingAreaId = null;
  isCreating = false;
  const activeContainer = document.getElementById('active-view');
  if (activeContainer) renderAreasView(activeContainer);
}

function handleAreaChange() {
  loadAndSortAreas();
  renderView();
}

function cleanupEventBus() {
  EventBus.off('areaCreated', handleAreaChange);
  EventBus.off('areaUpdated', handleAreaChange);
  EventBus.off('areaDeleted', handleAreaChange);
  EventBus.off('itemCreated', handleAreaChange);
  EventBus.off('itemUpdated', handleAreaChange);
  EventBus.off('itemDeleted', handleAreaChange);
}

function cleanupListeners() {
  cleanupEventBus();
  window.removeEventListener('keydown', handleGlobalKeydown);
  setSelectedAreaId(null);
}

function setSelectedAreaId(id) {
  selectedAreaId = id;
  if (id) {
    const area = areas.find(a => a.id === id) || Repository.getAreas().find(a => a.id === id);
    EventBus.emit('itemSelected', area || null);
    if (area) {
      EventBus.emit('viewTitleChanged', { title: 'Areas', breadcrumb: area.name });
    }
  } else {
    EventBus.emit('itemSelected', null);
    EventBus.emit('viewTitleChanged', { title: 'Areas', breadcrumb: null });
  }
}

// --- Rendering ---
function renderView() {
  if (!containerEl) return;

  if (selectedAreaId) {
    crossfade(containerEl, () => renderAreaDetail(selectedAreaId));
  } else if (areas.length === 0 && !isCreating) {
    crossfade(containerEl, () => renderEmpty());
  } else {
    crossfade(containerEl, () => renderAreasList());
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view" style="align-items: center; text-align: center; height: auto; padding: var(--space-lg) 0; margin: 0 auto;">
      <span style="color: var(--color-text-muted); display: block; margin-bottom: var(--space-md);">${FOLDER_ICON}</span>
      <h2>areas</h2>
      <p style="margin-bottom: 2px;">No Areas yet.</p>
      <p style="color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-xs);">Areas help organize related work.</p>
      <p style="color: var(--color-text-muted); margin-top: var(--space-xs);">Press <span style="color: var(--color-accent-blue)">N</span> to create your first Area.</p>
      <div style="margin-top: var(--space-md);">
        <button id="add-area-btn-empty" class="action-btn" style="border: 1px solid var(--color-border); padding: var(--space-xs) var(--space-sm); border-radius: 2px;">+ New Area</button>
      </div>
    </div>
  `;

  const btn = document.getElementById('add-area-btn-empty');
  if (btn) {
    btn.addEventListener('click', () => {
      isCreating = true;
      renderView();
    });
  }
}

function renderAreasList() {
  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="view-filter-bar" style="margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: var(--font-size-xs);">
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <span style="color: var(--color-text-muted);">sort</span>
          <select id="area-sort-select" class="inspector-select" style="width: auto; padding: 2px 4px; border: 1px solid var(--color-border);">
            <option value="updated" ${sortBy === 'updated' ? 'selected' : ''}>Recently Updated</option>
            <option value="alphabetical" ${sortBy === 'alphabetical' ? 'selected' : ''}>Alphabetical</option>
            <option value="created" ${sortBy === 'created' ? 'selected' : ''}>Recently Created</option>
            <option value="active" ${sortBy === 'active' ? 'selected' : ''}>Most Active</option>
          </select>
        </div>
        <button id="add-area-btn-list" class="action-btn" style="text-decoration:none;">+ New Area</button>
      </div>
      <div class="tasks-list-active" id="areas-items-list" role="listbox" aria-label="Areas list"></div>
    </div>
  `;

  const listEl = document.getElementById('areas-items-list');

  const sortSelect = document.getElementById('area-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      loadAndSortAreas();
      renderView();
    });
  }

  // Input row if creating
  if (isCreating) {
    const inputRow = document.createElement('div');
    inputRow.className = 'task-item selected';
    const input = createInput({
      placeholder: 'New Area name\u2026',
      onKeyDown: handleCreateKeyDown,
      onBlur: () => {
        isCreating = false;
        renderView();
      },
      id: 'new-area-input'
    });
    inputRow.appendChild(input);
    listEl.appendChild(inputRow);
    requestAnimationFrame(() => input.focus());
  }

  areas.forEach(area => {
    listEl.appendChild(buildAreaRow(area));
  });

  const btn = document.getElementById('add-area-btn-list');
  if (btn) {
    btn.addEventListener('click', () => {
      isCreating = true;
      renderView();
    });
  }

  // Restore keyboard focus to selected area
  if (selectedAreaId && !editingAreaId && !isCreating) {
    const el = listEl.querySelector(`[data-id="${selectedAreaId}"]`);
    if (el) requestAnimationFrame(() => el.focus());
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildAreaTaskRow(task) {
  const row = document.createElement('div');
  row.className = 'task-item';
  row.setAttribute('data-task-id', task.id);
  row.setAttribute('role', 'option');
  row.setAttribute('tabindex', '0');
  
  if (task.status === 'completed') {
    row.classList.add('completed');
  }

  // Checkbox
  row.appendChild(createCheckbox({
    checked: task.status === 'completed',
    onChange: () => {
      const nextStatus = task.status === 'completed' ? 'active' : 'completed';
      Repository.update(task.id, { status: nextStatus });
    }
  }));

  // Title
  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;
  row.appendChild(title);

  // Module badge
  const badge = document.createElement('span');
  badge.className = `task-badge badge-${task.module}`;
  badge.textContent = task.module;
  badge.style.marginLeft = 'auto';
  badge.style.fontSize = '10px';
  badge.style.fontFamily = 'var(--font-mono)';
  badge.style.color = 'var(--color-text-muted)';
  badge.style.border = '1px solid var(--color-border)';
  badge.style.borderRadius = '2px';
  badge.style.padding = '1px 4px';
  row.appendChild(badge);

  // Click handler
  row.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedTaskId = task.id;
    updateAreaDetailHighlights();
    EventBus.emit('itemSelected', task);
  });

  return row;
}

function updateAreaDetailHighlights() {
  const listEl = document.getElementById('area-tasks-list');
  if (!listEl) return;
  listEl.querySelectorAll('.task-item').forEach(el => {
    const taskId = el.getAttribute('data-task-id');
    if (taskId === selectedTaskId) {
      el.classList.add('selected');
      el.setAttribute('aria-selected', 'true');
      el.focus();
    } else {
      el.classList.remove('selected');
      el.setAttribute('aria-selected', 'false');
    }
  });
}

function renderAreaDetail(areaId) {
  const area = areas.find(a => a.id === areaId) || Repository.getAreas().find(a => a.id === areaId);
  if (!area) {
    setSelectedAreaId(null);
    renderView();
    return;
  }

  const allTasks = Repository.getAll().filter(item => 
    item.type !== 'area' && 
    item.areaId === areaId && 
    item.module !== 'archive'
  );

  containerEl.innerHTML = `
    <div class="focus-container">
      <div class="area-breadcrumbs" style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-sm); user-select: none;">
        <span id="breadcrumb-areas" style="color: var(--color-accent-blue); text-decoration: underline; cursor: pointer;">Areas</span>
        <span> &gt; </span>
        <span>${escapeHtml(area.name)}</span>
      </div>

      <div class="area-workspace-header" style="margin-bottom: var(--space-md);">
        <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2xs);">${escapeHtml(area.name)}</h2>
        ${area.description ? `<p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin: 0; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(area.description)}</p>` : `<p style="color: var(--color-text-muted); font-size: var(--font-size-sm); font-style: italic; margin: 0;">No description provided.</p>`}
      </div>

      <div class="tasks-section">
        <h3 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: var(--space-sm); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-2xs);">Tasks</h3>
        <div class="tasks-list-active" id="area-tasks-list" role="listbox" aria-label="Tasks in ${escapeHtml(area.name)}"></div>
      </div>
    </div>
  `;

  // Bind breadcrumb click
  const breadcrumbAreas = document.getElementById('breadcrumb-areas');
  if (breadcrumbAreas) {
    breadcrumbAreas.addEventListener('click', () => {
      setSelectedAreaId(null);
      selectedTaskId = null;
      renderView();
    });
  }

  const listEl = document.getElementById('area-tasks-list');
  if (allTasks.length === 0) {
    listEl.innerHTML = `
      <div class="placeholder-view" style="height: auto; padding: var(--space-lg) 0;">
        <span style="color: var(--color-text-muted); display: block; margin-bottom: var(--space-sm);">${FOLDER_ICON}</span>
        <p style="color: var(--color-text-primary); font-weight: 500; margin: 0 0 4px 0;">No tasks in this Area.</p>
        <p style="color: var(--color-text-secondary); margin: 0 0 var(--space-xs) 0; font-size: var(--font-size-xs);">Assign an existing task or create a new one.</p>
        <p style="color: var(--color-text-muted); margin: 0; font-size: var(--font-size-xs);">Press <span style="color: var(--color-accent-blue)">N</span> to create a task.</p>
      </div>
    `;
  } else {
    allTasks.forEach(task => {
      const taskRow = buildAreaTaskRow(task);
      listEl.appendChild(taskRow);
    });
    updateAreaDetailHighlights();
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'updated long ago';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'updated just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `updated ${days}d ago`;
}

function buildAreaRow(area) {
  const row = document.createElement('div');
  row.className = 'task-item';
  row.setAttribute('data-id', area.id);
  row.setAttribute('role', 'option');
  row.setAttribute('aria-selected', area.id === selectedAreaId ? 'true' : 'false');
  row.setAttribute('tabindex', '0');

  if (area.id === selectedAreaId) {
    row.classList.add('selected');
  }

  const isEditing = area.id === editingAreaId;

  if (isEditing) {
    const input = createInput({
      value: area.name,
      onKeyDown: (e) => handleEditKeyDown(e, area.id),
      onBlur: (e) => commitEdit(area.id, e.target.value),
      className: 'task-edit-input'
    });
    row.appendChild(input);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  } else {
    // We want the row itself to be a vertical flex column
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '2px';
    row.style.width = '100%';

    // Line 1: Top row (Folder icon + Name/Description + Updated Time)
    const line1 = document.createElement('div');
    line1.style.display = 'flex';
    line1.style.alignItems = 'center';
    line1.style.width = '100%';
    line1.style.minWidth = '0';

    // Add folder icon on the left of Line 1
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = FOLDER_ICON;
    iconSpan.style.display = 'flex';
    iconSpan.style.alignItems = 'center';
    iconSpan.style.flexShrink = '0';
    iconSpan.style.marginRight = '10px';
    line1.appendChild(iconSpan);

    // Content container for name & optional description
    const content = document.createElement('div');
    content.className = 'area-row-content';
    content.style.display = 'flex';
    content.style.flexDirection = 'row';
    content.style.alignItems = 'baseline';
    content.style.gap = 'var(--space-sm)';
    content.style.flex = '1';
    content.style.minWidth = '0';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'task-title';
    nameSpan.textContent = area.name;
    nameSpan.style.whiteSpace = 'nowrap';
    nameSpan.style.overflow = 'hidden';
    nameSpan.style.textOverflow = 'ellipsis';
    content.appendChild(nameSpan);

    if (area.description) {
      const descSpan = document.createElement('span');
      descSpan.className = 'area-desc';
      descSpan.textContent = area.description;
      descSpan.style.fontSize = 'var(--font-size-xs)';
      descSpan.style.color = 'var(--color-text-secondary)';
      descSpan.style.whiteSpace = 'nowrap';
      descSpan.style.overflow = 'hidden';
      descSpan.style.textOverflow = 'ellipsis';
      descSpan.style.flex = '1'; // Let the description shrink first
      content.appendChild(descSpan);
    }
    line1.appendChild(content);

    // "Updated Xh ago" on the right of Line 1
    const timeSpan = document.createElement('span');
    timeSpan.className = 'area-updated-time';
    timeSpan.style.fontSize = '10px';
    timeSpan.style.color = 'var(--color-text-muted)';
    timeSpan.style.fontFamily = 'var(--font-mono)';
    timeSpan.style.marginLeft = 'auto';
    timeSpan.style.flexShrink = '0';
    timeSpan.textContent = formatTimeAgo(area.updatedAt);
    line1.appendChild(timeSpan);

    row.appendChild(line1);

    // Line 2: Bottom row (Statistics left-aligned under the content)
    const line2 = document.createElement('div');
    line2.style.display = 'flex';
    line2.style.alignItems = 'center';
    line2.style.width = '100%';
    line2.style.paddingLeft = '24px'; // 14px icon + 10px marginRight = 24px to align under content
    line2.style.boxSizing = 'border-box';

    // Compute active, completed, parked, archived counts for the Area
    const allItems = Repository.getAll().filter(item => item.type !== 'area' && item.areaId === area.id);
    const activeCount = allItems.filter(item => (item.module === 'focus' || item.module === 'capture') && item.status !== 'completed').length;
    const completedCount = allItems.filter(item => item.status === 'completed' && item.module !== 'archive').length;
    const parkedCount = allItems.filter(item => item.module === 'parking-lot' && item.status !== 'completed').length;
    const archivedCount = allItems.filter(item => item.module === 'archive').length;

    const statsSpan = document.createElement('span');
    statsSpan.className = 'area-stats';
    statsSpan.style.fontSize = 'var(--font-size-xs)';
    statsSpan.style.color = 'var(--color-text-muted)';
    statsSpan.textContent = `${activeCount} active • ${completedCount} completed • ${parkedCount} parked • ${archivedCount} archived`;
    line2.appendChild(statsSpan);

    row.appendChild(line2);
  }

  // TUI plain text hover actions
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  if (!isEditing) {
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.textContent = 'edit';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startEditing(area.id);
    });
    actions.appendChild(editBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.textContent = 'archive';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteArea(area.id);
  });
  actions.appendChild(delBtn);

  row.appendChild(actions);

  if (!isEditing) {
    row.addEventListener('click', () => {
      setSelectedAreaId(area.id);
      isCreating = false;
      renderView();
    });
    row.addEventListener('dblclick', () => {
      setSelectedAreaId(area.id);
      renderView();
    });
  }

  return row;
}

// --- Area Operations ---
function handleCreateKeyDown(event) {
  if (event.key === 'Enter') {
    const name = event.target.value.trim();
    if (!name) {
      ToastService.show('Area name is required.', 'error');
      return;
    }
    if (name.length > 50) {
      ToastService.show('Area name must be 50 characters or less.', 'error');
      return;
    }

    const duplicate = areas.some(a => a.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      ToastService.show('An Area with this name already exists.', 'error');
      return;
    }

    const saved = Repository.saveArea({ name });
    isCreating = false;
    if (saved) {
      setSelectedAreaId(saved.id);
    } else {
      renderView();
    }
  } else if (event.key === 'Escape') {
    isCreating = false;
    renderView();
  }
}

function startEditing(areaId) {
  editingAreaId = areaId;
  setSelectedAreaId(areaId);
  isCreating = false;
  renderView();
}

function handleEditKeyDown(event, areaId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitEdit(areaId, event.target.value);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    editingAreaId = null;
    setSelectedAreaId(null);
    renderView();
  }
}

function commitEdit(areaId, newName) {
  const area = areas.find(a => a.id === areaId);
  const name = newName.trim();

  if (!name) {
    ToastService.show('Area name is required.', 'error');
    editingAreaId = null;
    renderView();
    return;
  }
  if (name.length > 50) {
    ToastService.show('Area name must be 50 characters or less.', 'error');
    editingAreaId = null;
    renderView();
    return;
  }

  if (area && area.name !== name) {
    const duplicate = areas.some(a => a.id !== areaId && a.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      ToastService.show('An Area with this name already exists.', 'error');
      editingAreaId = null;
      renderView();
      return;
    }
    Repository.saveArea({ ...area, name });
  }

  editingAreaId = null;
  setSelectedAreaId(areaId);
  renderView();
}

function deleteArea(areaId) {
  const area = areas.find(a => a.id === areaId);
  if (!area) return;

  const allTasks = Repository.getAll().filter(item => 
    item.type !== 'area' && 
    item.areaId === area.id && 
    item.module !== 'archive'
  );

  if (allTasks.length > 0) {
    ToastService.show(`Area contains ${allTasks.length} task${allTasks.length === 1 ? '' : 's'}. Move them first or archive them too.`, 'error');
    return;
  }

  DialogService.confirm({
    title: 'Archive Area',
    message: `Are you sure you want to archive the Area [${area.name}]?`,
    confirmText: 'Archive',
    cancelText: 'Cancel',
    variant: 'danger'
  }).then((confirmed) => {
    if (confirmed) {
      Repository.update(areaId, { archived: true });
      if (selectedAreaId === areaId) setSelectedAreaId(null);
      if (editingAreaId === areaId) editingAreaId = null;
      ToastService.show('Area archived.', 'info');
      EventBus.emit('itemSelected', null);
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

  if (selectedAreaId) {
    const areaTasks = Repository.getAll().filter(item => 
      item.type !== 'area' && 
      item.areaId === selectedAreaId && 
      item.module !== 'archive'
    );

    if (event.key === 'ArrowDown' && areaTasks.length > 0) {
      event.preventDefault();
      const currentIdx = areaTasks.findIndex(t => t.id === selectedTaskId);
      let nextIdx = currentIdx + 1;
      if (nextIdx >= areaTasks.length) nextIdx = areaTasks.length - 1;
      selectedTaskId = areaTasks[nextIdx].id;
      EventBus.emit('itemSelected', areaTasks[nextIdx]);
      updateAreaDetailHighlights();
    } else if (event.key === 'ArrowUp' && areaTasks.length > 0) {
      event.preventDefault();
      const currentIdx = areaTasks.findIndex(t => t.id === selectedTaskId);
      let prevIdx = currentIdx - 1;
      if (prevIdx < 0) prevIdx = 0;
      selectedTaskId = areaTasks[prevIdx].id;
      EventBus.emit('itemSelected', areaTasks[prevIdx]);
      updateAreaDetailHighlights();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setSelectedAreaId(null);
      selectedTaskId = null;
      renderView();
    }
    return;
  }

  // Press N to create an Area (or press A)
  if (event.key.toLowerCase() === 'n' || event.key.toLowerCase() === 'a') {
    event.preventDefault();
    isCreating = true;
    setSelectedAreaId(null);
    renderView();
    return;
  }

  if (!selectedAreaId || editingAreaId) {
    if (event.key === 'ArrowDown' && areas.length > 0) {
      event.preventDefault();
      setSelectedAreaId(areas[0].id);
      renderView();
    }
    return;
  }

  const idx = areas.findIndex(a => a.id === selectedAreaId);
  if (idx === -1) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (idx < areas.length - 1) {
        setSelectedAreaId(areas[idx + 1].id);
        renderView();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (idx > 0) {
        setSelectedAreaId(areas[idx - 1].id);
        renderView();
      } else {
        setSelectedAreaId(null);
        renderView();
      }
      break;
    case 'Enter':
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        setSelectedAreaId(selectedAreaId);
        const titleInput = document.getElementById('inspector-title-input');
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      } else {
        setSelectedAreaId(selectedAreaId);
        renderView();
      }
      break;
    case 'Escape':
      event.preventDefault();
      setSelectedAreaId(null);
      renderView();
      break;
    case 'Delete':
    case 'Backspace':
    case 'd':
    case 'D':
      event.preventDefault();
      deleteArea(selectedAreaId);
      break;
  }
}
