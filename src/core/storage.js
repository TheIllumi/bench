const STORAGE_KEY = 'bench_focus_tasks';

/**
 * StorageService handles persistence for Bench tasks.
 * It abstracts browser local storage to make it easy to migrate
 * to SQLite or file-based storage later.
 */
export const StorageService = {
  /**
   * Load tasks from local storage.
   * @returns {Array<{id: string, title: string, completed: boolean}>}
   */
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tasks from local storage:', error);
      return [];
    }
  },

  /**
   * Save tasks to local storage.
   * @param {Array<{id: string, title: string, completed: boolean}>} tasks
   */
  save(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to local storage:', error);
    }
  },

  /**
   * Clear all tasks from local storage.
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear tasks from local storage:', error);
    }
  }
};
