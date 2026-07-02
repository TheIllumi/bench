import { initializeViewManager } from './core/view-manager.js';
import { initializeShortcuts } from './core/shortcuts.js';

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

  console.log('Bench application shell successfully initialized.');
});
