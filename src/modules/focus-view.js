import { renderEmptyState } from '../ui/empty-state.js';

export function renderFocusView(container) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
  
  renderEmptyState(
    container,
    'Nothing here yet.',
    'Your three most important tasks will appear here.',
    icon
  );
}
