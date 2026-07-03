import { EventBus } from '../core/event-bus.js';
import { getRelativeTime } from './utils.js';

const STORAGE_KEY_WIDTH = 'bench_inspector_width';
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 260;
const MAX_WIDTH = 520;
const DEBOUNCE_MS = 500;
const SAVED_FADE_MS = 2000;

let panelEl = null;
let currentItem = null;
let debounceTimer = null;
let pendingField = null;
let pendingValue = null;
let savedFadeTimer = null;

// DOM references cached after render
let titleInput = null;
let notesTextarea = null;
let saveIndicator = null;
let areaField = null;
let moduleField = null;
let createdField = null;
let updatedField = null;

/**
 * The Inspector is a presentation-only component.
 * It emits `inspectorUpdate` events rather than calling Repository directly.
 */
export const Inspector = {
  resolveAreaName: null,

  /**
   * Subscribe to EventBus and bind to the #inspector-panel element.
   */
  init() {
    panelEl = document.getElementById('inspector-panel');
    if (!panelEl) return;

    // Restore saved width
    const savedWidth = localStorage.getItem(STORAGE_KEY_WIDTH);
    if (savedWidth) {
      const w = parseInt(savedWidth, 10);
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
        panelEl.style.setProperty('--inspector-width', `${w}px`);
      }
    }

    EventBus.on('itemSelected', (item) => {
      if (item) {
        this.open(item);
      } else {
        this.close();
      }
    });

    EventBus.on('itemUpdated', (updatedItem) => {
      if (!currentItem || updatedItem.id !== currentItem.id) return;
      currentItem = { ...currentItem, ...updatedItem };
      syncFields();
      showSaveState('Saved');
    });

    EventBus.on('itemDeleted', (deletedItem) => {
      if (currentItem && deletedItem.id === currentItem.id) {
        this.close();
      }
    });

    // Panel-level keyboard handler
    panelEl.addEventListener('keydown', handlePanelKeydown);

    renderEmpty();
  },

  /**
   * Display item details in the panel.
   */
  open(item) {
    if (!panelEl) return;
    if (currentItem && currentItem.id === item.id) {
      currentItem = { ...currentItem, ...item };
      syncFields();
      return;
    }
    this.flushPendingSaves();
    currentItem = { ...item };
    panelEl.classList.add('open');
    renderItem();
  },

  /**
   * Hide the panel and clear selection.
   */
  close() {
    if (!panelEl) return;
    this.flushPendingSaves();
    currentItem = null;
    panelEl.classList.remove('open');
    clearDomRefs();
    renderEmpty();
  },

  /**
   * Returns true if the Inspector is currently open.
   */
  isOpen() {
    return panelEl !== null && panelEl.classList.contains('open');
  },

  /**
   * Returns the currently displayed item ID or null.
   */
  getItemId() {
    return currentItem ? currentItem.id : null;
  },

  /**
   * Immediately emit any debounced inspectorUpdate.
   * Call before module switch, window close, app exit.
   */
  flushPendingSaves() {
    if (debounceTimer && pendingField && currentItem) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      EventBus.emit('inspectorUpdate', {
        id: currentItem.id,
        field: pendingField,
        value: pendingValue
      });
      pendingField = null;
      pendingValue = null;
    }
  }
};

// --- Rendering ---

function clearDomRefs() {
  titleInput = null;
  notesTextarea = null;
  saveIndicator = null;
  areaField = null;
  moduleField = null;
  createdField = null;
  updatedField = null;
}

function renderEmpty() {
  if (!panelEl) return;
  panelEl.innerHTML = `
    <div class="inspector-empty">
      <p>No item selected.</p>
      <p class="inspector-empty-hint">Select something to see its details.</p>
    </div>
  `;
  clearDomRefs();
}

function renderItem() {
  if (!panelEl || !currentItem) return;

  const areaName = getAreaName(currentItem.areaId);
  const moduleLabel = formatModule(currentItem.module);

  panelEl.innerHTML = `
    <div class="inspector-resize-handle" id="inspector-resize-handle"></div>
    <div class="inspector-content">
      <div class="inspector-header">
        <span class="inspector-title-label">Item Inspector</span>
        <div class="inspector-header-right">
          <span class="inspector-save-indicator" id="inspector-save-indicator"></span>
          <button class="inspector-close-btn" id="inspector-close-btn" aria-label="Close inspector">[&times;]</button>
        </div>
      </div>
      <div class="inspector-fields">
        <div class="inspector-field">
          <label class="inspector-label">title</label>
          <textarea class="inspector-title-input" id="inspector-title-input"
                    placeholder="Title" spellcheck="false" rows="1">${escapeHtml(currentItem.title || '')}</textarea>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">area</label>
          <span class="inspector-value" id="inspector-area-value">${areaName || '—'}</span>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">module</label>
          <span class="inspector-value" id="inspector-module-value">${moduleLabel}</span>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">created</label>
          <span class="inspector-value" id="inspector-created-value">${getRelativeTime(currentItem.createdAt)}</span>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">updated</label>
          <span class="inspector-value" id="inspector-updated-value">${getRelativeTime(currentItem.updatedAt)}</span>
        </div>
      </div>
      <div class="inspector-section future-metadata"></div>
      <div class="inspector-notes-section">
        <label class="inspector-label">notes</label>
        <textarea class="inspector-notes-editor" id="inspector-notes-editor"
                  placeholder="Write notes here…" spellcheck="false">${escapeHtml(currentItem.notes || '')}</textarea>
      </div>
    </div>
  `;

  // Cache DOM refs
  titleInput = document.getElementById('inspector-title-input');
  notesTextarea = document.getElementById('inspector-notes-editor');
  saveIndicator = document.getElementById('inspector-save-indicator');
  areaField = document.getElementById('inspector-area-value');
  moduleField = document.getElementById('inspector-module-value');
  createdField = document.getElementById('inspector-created-value');
  updatedField = document.getElementById('inspector-updated-value');

  // Bind title events
  titleInput.addEventListener('input', handleTitleInput);
  titleInput.addEventListener('blur', handleTitleBlur);
  titleInput.addEventListener('keydown', handleTitleKeydown);
  autoGrowTextarea(titleInput);

  // Bind notes events
  notesTextarea.addEventListener('input', handleNotesInput);
  notesTextarea.addEventListener('blur', handleNotesBlur);
  notesTextarea.addEventListener('keydown', handleNotesKeydown);
  autoGrowTextarea(notesTextarea);

  // Bind close button
  const closeBtn = document.getElementById('inspector-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      EventBus.emit('itemSelected', null);
    });
  }

  // Bind resize handle
  const resizeHandle = document.getElementById('inspector-resize-handle');
  if (resizeHandle) {
    resizeHandle.addEventListener('pointerdown', handleResizeStart);
    resizeHandle.addEventListener('dblclick', handleResizeReset);
  }
}

/**
 * Reactively update rendered fields without re-mounting.
 */
function syncFields() {
  if (!currentItem) return;

  // Only update title if the user is not actively editing it
  if (titleInput && document.activeElement !== titleInput) {
    titleInput.value = currentItem.title;
    autoGrowTextarea(titleInput);
  }

  // Only update notes if the user is not actively editing them
  if (notesTextarea && document.activeElement !== notesTextarea) {
    notesTextarea.value = currentItem.notes || '';
    autoGrowTextarea(notesTextarea);
  }

  if (areaField) areaField.textContent = getAreaName(currentItem.areaId) || '—';
  if (moduleField) moduleField.textContent = formatModule(currentItem.module);
  if (createdField) createdField.textContent = getRelativeTime(currentItem.createdAt);
  if (updatedField) updatedField.textContent = getRelativeTime(currentItem.updatedAt);
}

// --- Title Handling ---

function handleTitleInput() {
  autoGrowTextarea(titleInput);
}

function handleTitleBlur() {
  if (!currentItem || !titleInput) return;
  const newTitle = titleInput.value.trim();
  if (newTitle && newTitle !== currentItem.title) {
    EventBus.emit('inspectorUpdate', {
      id: currentItem.id,
      field: 'title',
      value: newTitle
    });
    showSaveState('Saving…');
  }
}

function handleTitleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    titleInput.blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    titleInput.blur();
  }
}

// --- Notes Handling ---

function handleNotesInput() {
  if (!currentItem || !notesTextarea) return;
  autoGrowTextarea(notesTextarea);

  const value = notesTextarea.value;
  pendingField = 'notes';
  pendingValue = value;

  showSaveState('Saving…');

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    EventBus.emit('inspectorUpdate', {
      id: currentItem.id,
      field: 'notes',
      value: pendingValue
    });
    pendingField = null;
    pendingValue = null;
  }, DEBOUNCE_MS);
}

function handleNotesBlur() {
  if (!currentItem || !notesTextarea) return;
  // Flush any pending debounce immediately
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    if (pendingField) {
      EventBus.emit('inspectorUpdate', {
        id: currentItem.id,
        field: pendingField,
        value: pendingValue
      });
      pendingField = null;
      pendingValue = null;
    }
  }
}

function handleNotesKeydown(e) {
  // Tab inserts 2 spaces instead of changing focus
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = notesTextarea.selectionStart;
    const end = notesTextarea.selectionEnd;
    const value = notesTextarea.value;
    notesTextarea.value = value.substring(0, start) + '  ' + value.substring(end);
    notesTextarea.selectionStart = notesTextarea.selectionEnd = start + 2;
    // Trigger input event for debounce
    notesTextarea.dispatchEvent(new Event('input'));
  }

  // Ctrl+S forces immediate save
  if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = null;
    EventBus.emit('inspectorUpdate', {
      id: currentItem.id,
      field: 'notes',
      value: notesTextarea.value
    });
    pendingField = null;
    pendingValue = null;
    showSaveState('Saving…');
  }

  // Escape blurs notes editor first, stops event propagation
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    notesTextarea.blur();
  }
}

// --- Panel Keyboard Handler ---

function handlePanelKeydown(e) {
  // Escape closes the Inspector
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    Inspector.close();
    EventBus.emit('itemSelected', null);
    return;
  }

  // Ctrl+Enter returns focus to the main list
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const activeView = document.getElementById('active-view');
    if (activeView) {
      const firstFocusable = activeView.querySelector('[tabindex="0"], input, button');
      if (firstFocusable) firstFocusable.focus();
      else activeView.focus();
    }
    return;
  }

  // Ctrl+L focuses the title input
  if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
    return;
  }
}

// --- Resize Handle ---

let resizing = false;
let resizeStartX = 0;
let resizeStartWidth = 0;

function handleResizeStart(e) {
  e.preventDefault();
  resizing = true;
  resizeStartX = e.clientX;
  resizeStartWidth = panelEl.offsetWidth;

  document.addEventListener('pointermove', handleResizeMove);
  document.addEventListener('pointerup', handleResizeEnd);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function handleResizeMove(e) {
  if (!resizing) return;
  // Dragging left increases width, dragging right decreases
  const delta = resizeStartX - e.clientX;
  let newWidth = resizeStartWidth + delta;
  newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
  panelEl.style.setProperty('--inspector-width', `${newWidth}px`);

  // Live reflow heights during drag resize
  autoGrowTextarea(notesTextarea);
  autoGrowTextarea(titleInput);
}

function handleResizeEnd() {
  if (!resizing) return;
  resizing = false;
  document.removeEventListener('pointermove', handleResizeMove);
  document.removeEventListener('pointerup', handleResizeEnd);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';

  // Persist width
  const currentWidth = panelEl.offsetWidth;
  localStorage.setItem(STORAGE_KEY_WIDTH, String(currentWidth));
}

function handleResizeReset() {
  panelEl.style.setProperty('--inspector-width', `${DEFAULT_WIDTH}px`);
  localStorage.setItem(STORAGE_KEY_WIDTH, String(DEFAULT_WIDTH));
}

// --- Save State Indicator ---

function showSaveState(text) {
  if (!saveIndicator) return;
  saveIndicator.textContent = text;
  saveIndicator.classList.add('visible');

  if (savedFadeTimer) clearTimeout(savedFadeTimer);

  if (text === 'Saved') {
    savedFadeTimer = setTimeout(() => {
      if (saveIndicator) saveIndicator.classList.remove('visible');
    }, SAVED_FADE_MS);
  }
}

// --- Auto-grow Textarea ---

function autoGrowTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// --- Helpers ---

function getAreaName(areaId) {
  if (!areaId) return null;
  if (typeof Inspector.resolveAreaName === 'function') {
    return Inspector.resolveAreaName(areaId);
  }
  return null;
}

function formatModule(mod) {
  const labels = {
    'focus': 'Focus',
    'capture': 'Capture',
    'parking-lot': 'Parking Lot',
    'archive': 'Archive'
  };
  return labels[mod] || mod;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
