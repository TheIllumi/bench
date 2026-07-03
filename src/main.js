import { initializeViewManager } from './core/view-manager.js';
import { initializeShortcuts, registerShortcut } from './core/shortcuts.js';
import { CommandPalette } from './core/command-palette.js';
import { QuickCapture } from './core/quick-capture.js';
import { Inspector } from './ui/inspector.js';
import { Repository } from './core/repository.js';
import { EventBus } from './core/event-bus.js';

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('bench_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }
}

function initializeWindowControls() {
  if (window.__TAURI__) {
    const { getCurrentWebviewWindow } = window.__TAURI__.webviewWindow;
    const appWindow = getCurrentWebviewWindow();

    const minBtn = document.getElementById('win-min');
    const maxBtn = document.getElementById('win-max');
    const closeBtn = document.getElementById('win-close');

    // Function to update icon based on actual maximized state
    const updateIcon = async () => {
      if (!maxBtn) return;
      const isMax = await appWindow.isMaximized();
      if (isMax) {
        maxBtn.innerHTML = `
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
            <path d="M3 1 H9 V7" stroke-width="1"/>
            <rect x="1" y="3" width="6" height="6"/>
          </svg>
        `;
        maxBtn.setAttribute('aria-label', 'restore');
      } else {
        maxBtn.innerHTML = `
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
            <rect x="1" y="1" width="8" height="8"/>
          </svg>
        `;
        maxBtn.setAttribute('aria-label', 'maximize');
      }
    };

    if (minBtn) {
      minBtn.addEventListener('click', () => {
        appWindow.minimize();
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener('click', async () => {
        await appWindow.toggleMaximize();
        updateIcon();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        appWindow.close();
      });
    }

    // Support double click on drag region to toggle maximize
    const dragRegion = document.querySelector('.title-bar-drag');
    if (dragRegion) {
      dragRegion.addEventListener('dblclick', async () => {
        await appWindow.toggleMaximize();
        updateIcon();
      });
    }

    // Update icon initially and on window resize (which happens on maximize/restore)
    updateIcon();
    window.addEventListener('resize', updateIcon);
  } else {
    console.log('Custom window controls running in browser mock mode.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Initialize custom window titlebar controls
  initializeWindowControls();

  // Initialize dynamic view/module routing
  initializeViewManager();

  // Initialize global and navigation keyboard shortcuts
  initializeShortcuts();

  // Toggle Command Palette via titlebar button
  const paletteBtn = document.getElementById('titlebar-shortcut-btn');
  if (paletteBtn) {
    paletteBtn.addEventListener('click', () => {
      CommandPalette.toggle();
    });
  }

  // Restore persisted sidebar collapsed state
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (sidebar) {
    const isCollapsed = localStorage.getItem('bench_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleSidebar();
    });
  }

  // Register Ctrl+B shortcut to toggle sidebar
  registerShortcut('ctrl+b', () => {
    toggleSidebar();
  });

  // Register Quick Capture shortcuts
  registerShortcut('ctrl+n', () => QuickCapture.open());
  registerShortcut('meta+n', () => QuickCapture.open());
  registerShortcut('c', () => QuickCapture.open());

  // Wire Area resolver for the Inspector to decouple it from storage
  Inspector.resolveAreaName = (areaId) => {
    const areas = Repository.getAreas();
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : null;
  };

  // Initialize Inspector panel
  Inspector.init();

  // Application-layer persistence bridge:
  // Inspector emits inspectorUpdate events, this listener calls Repository
  EventBus.on('inspectorUpdate', ({ id, field, value }) => {
    Repository.update(id, { [field]: value });
  });

  // Flush pending Inspector saves on window close / tab close
  window.addEventListener('beforeunload', () => {
    Inspector.flushPendingSaves();
  });

  console.log('Bench application shell successfully initialized.');
});
