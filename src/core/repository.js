import { EventBus } from './event-bus.js';

const STORAGE_KEY = 'bench_items';
const OLD_STORAGE_KEY = 'bench_focus_tasks';

/**
 * Unified Repository Layer for Bench.
 * Isolates data storage details from UI modules. Replaces module-specific
 * persistence layers with a single source of truth using a flat Item model.
 */
export const Repository = {
  /**
   * Retrieve all items in the store.
   * Performs migration from the old `bench_focus_tasks` local storage key if needed.
   * @returns {Array<object>}
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Check for legacy localStorage data
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        const oldTasks = JSON.parse(oldData);
        const migrated = oldTasks.map(t => ({
          id: t.id,
          title: t.title,
          notes: '',
          status: t.completed ? 'completed' : 'active',
          module: 'focus',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(OLD_STORAGE_KEY);
        console.log(`Migrated ${migrated.length} tasks to the new unified domain repository.`);
        return migrated;
      }

      return [];
    } catch (e) {
      console.error('Failed to load items from repository:', e);
      return [];
    }
  },

  /**
   * Retrieve all items belonging to a specific module.
   * @param {string} moduleName
   * @returns {Array<object>}
   */
  getByModule(moduleName) {
    return this.getAll().filter(item => item.module === moduleName && item.type !== 'area');
  },

  /**
   * Create or replace an item.
   * Fires event `itemCreated` or `itemUpdated`.
   * @param {object} item
   * @param {number} [atIndex] Optional index to insert the new item at
   * @returns {object} The saved item
   */
  save(item, atIndex = undefined) {
    const items = this.getAll();
    const now = Date.now();

    const newItem = {
      id: item.id || crypto.randomUUID(),
      title: item.title || '',
      notes: item.notes || '',
      status: item.status || 'active',
      module: item.module || 'focus',
      areaId: item.areaId || undefined,
      createdAt: item.createdAt || now,
      updatedAt: now
    };

    const idx = items.findIndex(i => i.id === newItem.id);
    if (idx !== -1) {
      items[idx] = newItem;
      this._saveRaw(items);
      EventBus.emit('itemUpdated', newItem);
    } else {
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= items.length) {
        items.splice(atIndex, 0, newItem);
      } else {
        items.push(newItem);
      }
      this._saveRaw(items);
      EventBus.emit('itemCreated', newItem);
    }

    return newItem;
  },

  /**
   * Update specific properties of an existing item.
   * Fires event `itemUpdated`.
   * @param {string} id
   * @param {object} updates
   * @returns {object|null} The updated item, or null if not found
   */
  update(id, updates) {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const item = items[idx];
    if (item.type === 'area') {
      const merged = { ...item, ...updates };
      const name = (merged.name || '').trim();
      if (!name || name.length > 50) return null;
      const duplicate = items.some(i => i.type === 'area' && i.id !== id && i.name.toLowerCase() === name.toLowerCase());
      if (duplicate) return null;
    }

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: Date.now()
    };

    items[idx] = updatedItem;
    this._saveRaw(items);

    if (updatedItem.type === 'area') {
      EventBus.emit('areaUpdated', updatedItem);
    } else {
      EventBus.emit('itemUpdated', updatedItem);
    }
    return updatedItem;
  },

  /**
   * Remove an item from the repository.
   * Fires event `itemDeleted`.
   * @param {string} id
   * @returns {boolean} True if deleted successfully, false otherwise
   */
  remove(id) {
    const items = this.getAll();
    const item = items.find(i => i.id === id);
    if (!item) return false;

    const filtered = items.filter(i => i.id !== id);
    this._saveRaw(filtered);

    EventBus.emit('itemDeleted', item);
    return true;
  },

  /**
   * Move an item from one module to another.
   * Fires event `itemUpdated`.
   * @param {string} id
   * @param {string} targetModule
   * @returns {object|null}
   */
  move(id, targetModule) {
    return this.update(id, { module: targetModule });
  },

  /**
   * Save a newly ordered list of items within a module.
   * Fires event `itemMoved`.
   * @param {string} moduleName
   * @param {Array<string>} orderedIds
   */
  reorder(moduleName, orderedIds) {
    const allItems = this.getAll();
    const moduleItems = allItems.filter(item => item.module === moduleName);
    const otherItems = allItems.filter(item => item.module !== moduleName);

    // Map according to the orderedIds list
    const sortedModuleItems = orderedIds
      .map(id => moduleItems.find(item => item.id === id))
      .filter(Boolean);

    // Safety fallback: append any module items missing from the orderedIds
    moduleItems.forEach(item => {
      if (!orderedIds.includes(item.id)) {
        sortedModuleItems.push(item);
      }
    });

    const combined = [...sortedModuleItems, ...otherItems];
    this._saveRaw(combined);

    EventBus.emit('itemMoved', { module: moduleName, items: sortedModuleItems });
  },

  /**
   * Wipe all items belonging to a specific module.
   * Fires event `itemDeleted` for each removed item.
   * @param {string} moduleName
   */
  clearModule(moduleName) {
    const allItems = this.getAll();
    const toKeep = allItems.filter(i => i.module !== moduleName);
    const toDelete = allItems.filter(i => i.module === moduleName);

    this._saveRaw(toKeep);
    toDelete.forEach(item => EventBus.emit('itemDeleted', item));
  },

  /**
   * Get all Area entities.
   * @returns {Array<object>}
   */
  getAreas() {
    return this.getAll().filter(item => item.type === 'area');
  },

  /**
   * Create or update an Area entity.
   * Fires event `areaCreated` or `areaUpdated`.
   * @param {object} area
   * @returns {object} The saved area
   */
  saveArea(area) {
    const items = this.getAll();
    const now = Date.now();
    const name = (area.name || '').trim();

    if (!name || name.length > 50) {
      return null;
    }

    const duplicate = items.some(i => i.type === 'area' && i.id !== area.id && i.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return null;
    }

    const newArea = {
      id: area.id || crypto.randomUUID(),
      type: 'area',
      name,
      description: area.description || '',
      icon: area.icon || '',
      color: area.color || '',
      createdAt: area.createdAt || now,
      updatedAt: now,
      archived: area.archived !== undefined ? area.archived : false
    };

    const idx = items.findIndex(i => i.id === newArea.id && i.type === 'area');
    if (idx !== -1) {
      items[idx] = newArea;
      this._saveRaw(items);
      EventBus.emit('areaUpdated', newArea);
    } else {
      items.push(newArea);
      this._saveRaw(items);
      EventBus.emit('areaCreated', newArea);
    }
    return newArea;
  },

  /**
   * Delete an Area entity if not referenced by any items.
   * Fires event `areaDeleted`.
   * @param {string} id
   * @returns {boolean} True if deleted, false if in-use or not found
   */
  deleteArea(id) {
    const items = this.getAll();

    // Check if in use by any focus or capture tasks/items
    const inUse = items.some(item => item.areaId === id);
    if (inUse) {
      return false;
    }

    const area = items.find(i => i.id === id && i.type === 'area');
    if (!area) return false;

    const filtered = items.filter(i => i.id !== id);
    this._saveRaw(filtered);

    EventBus.emit('areaDeleted', area);
    return true;
  },

  /**
   * Internal wrapper to write items array directly to localStorage.
   */
  _saveRaw(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save raw items payload:', e);
    }
  }
};
