import { renderEmptyState } from '../ui/empty-state.js';

export function renderAreasView(container) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>`;
  
  renderEmptyState(
    container,
    'No areas created.',
    'Group your projects and tasks by high-level domains here.',
    icon
  );
}
