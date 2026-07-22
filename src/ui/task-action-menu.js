/**
 * Helper to build responsive task actions (inline vs compact More menu).
 * Dynamically adapts based on available task row container width.
 */

/**
 * Open floating contextual action menu next to More button.
 * @param {Event} e - Trigger click event
 * @param {Array<HTMLButtonElement>} actionButtons - Array of action buttons
 */
export function openTaskActionMenu(e, actionButtons) {
  e.stopPropagation();

  // Remove existing action menus
  const existing = document.querySelector('.task-action-menu');
  if (existing) existing.remove();

  const triggerEl = e.currentTarget || e.target;
  const rect = triggerEl.getBoundingClientRect();

  const menu = document.createElement('div');
  menu.className = 'task-action-menu';

  // Align menu below the trigger button, clamped inside window right edge
  const leftPos = Math.min(rect.left + window.scrollX, window.innerWidth - 130);
  menu.style.top = `${rect.bottom + window.scrollY + 2}px`;
  menu.style.left = `${Math.max(10, leftPos)}px`;

  actionButtons.forEach(btn => {
    const menuItem = document.createElement('button');
    menuItem.className = 'task-action-menu-item';
    if (btn.classList.contains('btn-danger')) {
      menuItem.classList.add('btn-danger');
    }
    if (btn.classList.contains('active')) {
      menuItem.classList.add('active');
    }
    menuItem.textContent = btn.textContent;

    menuItem.addEventListener('click', (evt) => {
      evt.stopPropagation();
      menu.remove();
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', handleKeydown);
      btn.click();
    });
    menu.appendChild(menuItem);
  });

  document.body.appendChild(menu);

  // Close menu on click outside
  const closeMenu = (evt) => {
    if (!menu.contains(evt.target) && !triggerEl.contains(evt.target)) {
      menu.remove();
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', handleKeydown);
    }
  };

  // Close menu on Escape key
  const handleKeydown = (evt) => {
    if (evt.key === 'Escape') {
      menu.remove();
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', handleKeydown);
    }
  };

  setTimeout(() => {
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', handleKeydown);
  }, 0);
}

/**
 * Create a task-actions wrapper containing both inline buttons and More button.
 * @param {Array<HTMLButtonElement>} actionButtons - Array of action buttons
 * @returns {HTMLDivElement}
 */
export function createResponsiveTaskActions(actionButtons) {
  const container = document.createElement('div');
  container.className = 'task-actions';

  // Inline container for wide viewports
  const inlineContainer = document.createElement('div');
  inlineContainer.className = 'task-actions-inline';
  actionButtons.forEach(btn => {
    inlineContainer.appendChild(btn);
  });

  // More button container for narrow viewports
  const moreContainer = document.createElement('div');
  moreContainer.className = 'task-actions-more';

  const moreBtn = document.createElement('button');
  moreBtn.className = 'action-btn task-more-btn';
  moreBtn.setAttribute('tabindex', '-1');
  moreBtn.setAttribute('aria-label', 'More task actions');
  moreBtn.textContent = '···';

  moreBtn.addEventListener('click', (e) => {
    openTaskActionMenu(e, actionButtons);
  });

  moreContainer.appendChild(moreBtn);

  container.appendChild(inlineContainer);
  container.appendChild(moreContainer);

  return container;
}
