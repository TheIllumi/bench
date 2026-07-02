/**
 * Replace container contents with a crossfade transition.
 * Fades out old content, calls buildFn to populate new content, then fades in.
 * @param {HTMLElement} containerEl
 * @param {Function} buildFn
 */
export function crossfade(containerEl, buildFn) {
  if (!containerEl) return;

  // If container is empty (first render), skip the fade-out
  if (!containerEl.firstChild) {
    buildFn();
    containerEl.classList.add('view-fade-in');
    requestAnimationFrame(() => containerEl.classList.add('view-visible'));
    return;
  }

  containerEl.classList.remove('view-visible');
  containerEl.classList.add('view-fade-in');

  const onDone = () => {
    containerEl.removeEventListener('transitionend', onDone);
    buildFn();
    requestAnimationFrame(() => containerEl.classList.add('view-visible'));
  };

  containerEl.addEventListener('transitionend', onDone, { once: true });

  // Safety fallback
  setTimeout(() => {
    if (!containerEl.classList.contains('view-visible')) {
      containerEl.removeEventListener('transitionend', onDone);
      buildFn();
      requestAnimationFrame(() => containerEl.classList.add('view-visible'));
    }
  }, 200);
}

/**
 * Format timestamp into relative time string.
 * @param {number} timestamp
 * @returns {string}
 */
export function getRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
