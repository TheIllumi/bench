import { Repository } from '../core/repository.js';
import { EventBus } from '../core/event-bus.js';
import { ToastService } from '../ui/toast.js';
import { DialogService } from '../ui/dialog.js';
import { createInput } from '../ui/input.js';
import { crossfade } from '../ui/utils.js';

let areas = [];
let selectedAreaId = null;
let editingAreaId = null;
let containerEl = null;
let isCreating = false;

/**
 * Mount the Areas view.
 */
export function renderAreasView(container) {
  container.innerHTML = '';
  containerEl = document.createElement('div');
  containerEl.className = 'areas-view';
  container.appendChild(containerEl);

  areas = Repository.getAreas().filter(a => !a.archived);

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

function handleAreaChange() {
  areas = Repository.getAreas().filter(a => !a.archived);
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
  } else {
    EventBus.emit('itemSelected', null);
  }
}

// --- Rendering ---
function renderView() {
  if (!containerEl) return;

  if (areas.length === 0 && !isCreating) {
    crossfade(containerEl, () => renderEmpty());
  } else {
    crossfade(containerEl, () => renderAreasList());
  }
}

function renderEmpty() {
  containerEl.innerHTML = `
    <div class="placeholder-view">
      <h2>areas</h2>
      <p>No Areas yet.</p>
      <p style="color: var(--color-text-muted); font-size: var(--font-size-xs); max-width: 320px; margin: var(--space-sm) 0 var(--space-xs) 0; line-height: 1.4;">
        Areas represent ongoing, long-term responsibilities rather than projects.
      </p>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-bottom: var(--space-md); margin-top: 0;">
        Examples: University, Health, Career, Finance
      </p>
      <div>
        <button id="add-area-btn-empty" class="action-btn" style="border: 1px solid var(--color-border); padding: var(--space-xs) var(--space-sm);">+ New Area</button>
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
      <div class="completed-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-sm);">
        <span>Responsibilities</span>
        <button id="add-area-btn-list" class="action-btn" style="text-decoration:none;">+ New Area</button>
      </div>
      <div class="tasks-list-active" id="areas-items-list" role="listbox" aria-label="Areas list"></div>
    </div>
  `;

  const listEl = document.getElementById('areas-items-list');

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
    const content = document.createElement('div');
    content.className = 'area-row-content';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '2px';
    content.style.flex = '1';
    content.style.minWidth = '0';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'task-title';
    nameSpan.textContent = area.name;
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
      content.appendChild(descSpan);
    }

    row.appendChild(content);

    // Compute active task count
    const activeCount = Repository.getAll().filter(item => 
      item.type !== 'area' && 
      item.areaId === area.id && 
      item.module !== 'archive'
    ).length;

    const countBadge = document.createElement('span');
    countBadge.className = 'area-count-badge';
    countBadge.textContent = `${activeCount} active item${activeCount === 1 ? '' : 's'}`;
    countBadge.style.fontSize = 'var(--font-size-xs)';
    countBadge.style.color = 'var(--color-text-muted)';
    countBadge.style.marginLeft = 'var(--space-sm)';
    countBadge.style.flexShrink = '0';
    row.appendChild(countBadge);
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
  delBtn.textContent = 'archive'; // Plain TUI style label matches specifications
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
      startEditing(area.id);
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

  // Press A to Add Area
  if (event.key.toLowerCase() === 'a') {
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
      startEditing(selectedAreaId);
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
