import { renderEmptyState } from '../ui/empty-state.js';

export function renderArchiveView(container) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`;
  
  renderEmptyState(
    container,
    'Clean slate.',
    'Projects you complete or retire will be kept safe here.',
    icon
  );
}
