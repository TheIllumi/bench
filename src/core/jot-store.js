const STORAGE_KEY = 'bench_jot';

/**
 * Unified persistence layer for the Jot module.
 * Isolates localStorage interactions from the UI view.
 */
export const JotStore = {
  /**
   * Load the saved Jot content.
   * @returns {string}
   */
  loadJot() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (e) {
      console.error('Failed to load Jot content:', e);
      return '';
    }
  },

  /**
   * Save the Jot content.
   * @param {string} content
   */
  saveJot(content) {
    try {
      localStorage.setItem(STORAGE_KEY, content);
    } catch (e) {
      console.error('Failed to save Jot content:', e);
    }
  },

  /**
   * Clear the Jot content.
   */
  clearJot() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear Jot content:', e);
    }
  }
};
