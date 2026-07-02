import { initializeViewManager } from './core/view-manager.js';
import { initializeShortcuts } from './core/shortcuts.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialize dynamic view/module routing
  initializeViewManager();

  // Initialize global and navigation keyboard shortcuts
  initializeShortcuts();

  console.log('Bench application shell successfully initialized.');
});
