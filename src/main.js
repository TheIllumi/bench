import { initializeViewManager } from './core/view-manager.js';
import { initializeShortcuts, registerShortcut } from './core/shortcuts.js';
import { CommandPalette } from './core/command-palette.js';

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
    const { getCurrentWindow } = window.__TAURI__.window;
    const appWindow = getCurrentWindow();

    const minBtn = document.getElementById('win-min');
    const maxBtn = document.getElementById('win-max');
    const closeBtn = document.getElementById('win-close');

    if (minBtn) {
      minBtn.addEventListener('click', () => {
        appWindow.minimize();
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        appWindow.toggleMaximize();
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
      dragRegion.addEventListener('dblclick', () => {
        appWindow.toggleMaximize();
      });
    }
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

  console.log('Bench application shell successfully initialized.');
});
