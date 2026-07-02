const listeners = {};

/**
 * Lightweight, dependency-free global event bus.
 * Enables modules and core services to react to domain state changes
 * (e.g. item creation, updates, deletes) in a decoupled manner.
 */
export const EventBus = {
  /**
   * Subscribe to a channel.
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },

  /**
   * Unsubscribe from a channel.
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },

  /**
   * Publish an event.
   * @param {string} event - Event name
   * @param {any} data - Event payload data
   */
  emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
  }
};
