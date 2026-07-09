import { SettingsStore } from '../core/settings-store.js';
import { Repository } from '../core/repository.js';
import { DialogService } from '../ui/dialog.js';
import { ToastService } from '../ui/toast.js';
import { JotStore } from '../core/jot-store.js';

export function renderSettingsView(container) {
  const settings = SettingsStore.load();

  const backup = localStorage.getItem('bench_local_backup');
  let backupTimeText = 'restore backup';
  if (backup) {
    try {
      const parsed = JSON.parse(backup);
      if (parsed && parsed.timestamp) {
        const timeStr = new Date(parsed.timestamp).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        backupTimeText = `restore (backup: ${timeStr})`;
      }
    } catch (e) {}
  }

  container.innerHTML = `
    <div class="settings-view">
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- General -->
        <div>
          <div class="completed-header">General</div>
          <div class="settings-list-group">
            
            <div class="settings-subheader">Appearance</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Theme</span>
                <select id="settings-theme" class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);">
                  <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>System</option>
                  <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                  <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                </select>
              </div>

              <div class="settings-item">
                <span class="settings-label">Accent Color</span>
                <select id="settings-accent" class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" disabled>
                  <option value="blue">Blue (Default)</option>
                </select>
              </div>

              <div class="settings-item">
                <span class="settings-label">Compact Mode</span>
                <input type="checkbox" id="settings-compact" class="bench-checkbox" ${settings.compactMode ? 'checked' : ''}>
              </div>

              <div class="settings-item">
                <span class="settings-label">Font Size</span>
                <select id="settings-font-size" class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);">
                  <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                  <option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
              </div>

              <div class="settings-item">
                <span class="settings-label">Reduce Animations</span>
                <input type="checkbox" id="settings-reduce-animations" class="bench-checkbox" ${settings.reduceAnimations ? 'checked' : ''}>
              </div>
            </div>

            <div class="settings-subheader" style="margin-top: var(--space-md);">Behavior</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Confirm before deleting</span>
                <input type="checkbox" id="settings-confirm-delete" class="bench-checkbox" ${settings.confirmDelete ? 'checked' : ''}>
              </div>

              <div class="settings-item">
                <span class="settings-label">Confirm before archiving</span>
                <input type="checkbox" id="settings-confirm-archive" class="bench-checkbox" ${settings.confirmArchive ? 'checked' : ''}>
              </div>

              <div class="settings-item">
                <span class="settings-label">Default startup module</span>
                <select id="settings-startup-module" class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" ${settings.rememberLastModule ? 'disabled' : ''}>
                  <option value="focus" ${settings.startupModule === 'focus' ? 'selected' : ''}>Focus</option>
                  <option value="capture" ${settings.startupModule === 'capture' ? 'selected' : ''}>Capture</option>
                  <option value="areas" ${settings.startupModule === 'areas' ? 'selected' : ''}>Areas</option>
                  <option value="parking-lot" ${settings.startupModule === 'parking-lot' ? 'selected' : ''}>Parking Lot</option>
                  <option value="archive" ${settings.startupModule === 'archive' ? 'selected' : ''}>Archive</option>
                  <option value="jot" ${settings.startupModule === 'jot' ? 'selected' : ''}>Jot</option>
                  <option value="settings" ${settings.startupModule === 'settings' ? 'selected' : ''}>Settings</option>
                </select>
              </div>

              <div class="settings-item">
                <span class="settings-label">Remember last opened module</span>
                <input type="checkbox" id="settings-remember-last-module" class="bench-checkbox" ${settings.rememberLastModule ? 'checked' : ''}>
              </div>
            </div>

          </div>
        </div>

        <!-- Productivity -->
        <div>
          <div class="completed-header">Productivity</div>
          <div class="settings-list-group">
            
            <div class="settings-subheader">Focus</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Max Focus Tasks</span>
                <span class="settings-value">3 (Strict Limit)</span>
              </div>
              <div class="settings-item">
                <span class="settings-label">Auto-clear completed tasks</span>
                <input type="checkbox" class="bench-checkbox" disabled>
              </div>

            </div>

            <div class="settings-subheader" style="margin-top: var(--space-md);">Areas</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Confirm before archiving Area</span>
                <input type="checkbox" class="bench-checkbox" disabled checked>
              </div>
              <div class="settings-item">
                <span class="settings-label">Default Area for new tasks</span>
                <select class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" disabled>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div class="settings-subheader" style="margin-top: var(--space-md);">Jot</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Default Font Family</span>
                <select class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" disabled>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <div class="settings-item">
                <span class="settings-label">Tab size</span>
                <select class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" disabled>
                  <option value="tab">Tab Character</option>
                </select>
              </div>
              <div class="settings-item">
                <span class="settings-label">Auto-save on keystroke</span>
                <input type="checkbox" class="bench-checkbox" disabled checked>
              </div>
            </div>
            
          </div>
        </div>

        <!-- Data -->
        <div>
          <div class="completed-header">Data</div>
          <div class="settings-list">
            <div class="settings-item action-item" id="settings-data-import">
              <span class="settings-label">Import</span>
              <span class="settings-action-text">import JSON</span>
            </div>
            <div class="settings-item action-item" id="settings-data-export">
              <span class="settings-label">Export</span>
              <span class="settings-action-text">export JSON</span>
            </div>
            <div class="settings-item action-item" id="settings-data-backup">
              <span class="settings-label">Backup</span>
              <span class="settings-action-text">create backup</span>
            </div>
            <div class="settings-item action-item" id="settings-data-restore">
              <span class="settings-label">Restore</span>
              <span class="settings-action-text" id="settings-data-restore-btn">${backupTimeText}</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div>
          <div class="completed-header" style="color: var(--color-danger);">Danger Zone</div>
          <div class="settings-list" style="border-left-color: rgba(247, 118, 142, 0.2);">
            <div class="settings-item action-item" id="settings-danger-clear-archive">
              <span class="settings-label" style="color: var(--color-danger);">Clear Archive</span>
              <span class="settings-action-text" style="color: var(--color-danger);">clear</span>
            </div>
            <div class="settings-item action-item" id="settings-danger-clear-database">
              <span class="settings-label" style="color: var(--color-danger);">Clear Database</span>
              <span class="settings-action-text" style="color: var(--color-danger);">wipe</span>
            </div>
          </div>
        </div>

        <!-- About -->
        <div>
          <div class="completed-header">About</div>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">Version</span>
              <span class="settings-value">0.1.0</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Changelog</span>
              <span class="settings-value">v0.1.0-alpha</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Credits</span>
              <span class="settings-value">Saad M.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind change events to save configuration state
  const themeSelect = container.querySelector('#settings-theme');
  const compactCheck = container.querySelector('#settings-compact');
  const fontSizeSelect = container.querySelector('#settings-font-size');
  const reduceAnimCheck = container.querySelector('#settings-reduce-animations');

  const confirmDeleteCheck = container.querySelector('#settings-confirm-delete');
  const confirmArchiveCheck = container.querySelector('#settings-confirm-archive');
  const startupModuleSelect = container.querySelector('#settings-startup-module');
  const rememberLastModuleCheck = container.querySelector('#settings-remember-last-module');

  function updateSettings() {
    const nextSettings = {
      theme: themeSelect.value,
      accentColor: 'blue',
      compactMode: compactCheck.checked,
      fontSize: fontSizeSelect.value,
      reduceAnimations: reduceAnimCheck.checked,

      confirmDelete: confirmDeleteCheck.checked,
      confirmArchive: confirmArchiveCheck.checked,
      startupModule: startupModuleSelect.value,
      rememberLastModule: rememberLastModuleCheck.checked,
      lastOpenedModule: settings.lastOpenedModule
    };

    startupModuleSelect.disabled = rememberLastModuleCheck.checked;
    SettingsStore.save(nextSettings);
  }

  themeSelect.addEventListener('change', updateSettings);
  compactCheck.addEventListener('change', updateSettings);
  fontSizeSelect.addEventListener('change', updateSettings);
  reduceAnimCheck.addEventListener('change', updateSettings);

  confirmDeleteCheck.addEventListener('change', updateSettings);
  confirmArchiveCheck.addEventListener('change', updateSettings);
  startupModuleSelect.addEventListener('change', updateSettings);
  rememberLastModuleCheck.addEventListener('change', updateSettings);

  // Data actions
  const importBtn = container.querySelector('#settings-data-import');
  const exportBtn = container.querySelector('#settings-data-export');
  const backupBtn = container.querySelector('#settings-data-backup');
  const restoreBtn = container.querySelector('#settings-data-restore');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const exportData = {
          version: '0.1.0',
          items: Repository.getAll(),
          settings: SettingsStore.load(),
          jot: JotStore.loadJot()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bench_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ToastService.show('Data exported successfully.', 'success');
      } catch (err) {
        console.error(err);
        ToastService.show('Failed to export data.', 'error');
      }
    });
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (!imported || !Array.isArray(imported.items)) {
              ToastService.show('Invalid file format. Missing items.', 'error');
              return;
            }
            DialogService.confirm({
              title: 'Import Data',
              message: 'Importing will completely overwrite all your current tasks, projects, areas, settings, and jots. Are you sure you want to proceed?',
              confirmText: 'Import',
              cancelText: 'Cancel',
              variant: 'danger'
            }).then((confirmed) => {
              if (confirmed) {
                localStorage.setItem('bench_items', JSON.stringify(imported.items));
                if (imported.settings) {
                  SettingsStore.save(imported.settings);
                }
                if (imported.jot !== undefined) {
                  localStorage.setItem('bench_jot', imported.jot);
                }
                ToastService.show('Data imported successfully.', 'success');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          } catch (err) {
            ToastService.show('Failed to parse JSON file.', 'error');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  if (backupBtn) {
    backupBtn.addEventListener('click', () => {
      try {
        const backupData = {
          timestamp: Date.now(),
          items: Repository.getAll(),
          settings: SettingsStore.load(),
          jot: JotStore.loadJot()
        };
        localStorage.setItem('bench_local_backup', JSON.stringify(backupData));
        ToastService.show('Local backup created successfully.', 'success');
        
        const restoreText = container.querySelector('#settings-data-restore-btn');
        if (restoreText) {
          const timeStr = new Date(backupData.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          restoreText.textContent = `restore (backup: ${timeStr})`;
        }
      } catch (err) {
        console.error(err);
        ToastService.show('Failed to create backup.', 'error');
      }
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      const backup = localStorage.getItem('bench_local_backup');
      if (!backup) {
        ToastService.show('No local backup found. Create a backup first.', 'error');
        return;
      }
      try {
        const parsed = JSON.parse(backup);
        const backupTime = new Date(parsed.timestamp).toLocaleString();
        DialogService.confirm({
          title: 'Restore Backup',
          message: `Restoring will replace all your current data with the backup from ${backupTime}. Are you sure you want to proceed?`,
          confirmText: 'Restore',
          cancelText: 'Cancel',
          variant: 'danger'
        }).then((confirmed) => {
          if (confirmed) {
            localStorage.setItem('bench_items', JSON.stringify(parsed.items));
            if (parsed.settings) {
              SettingsStore.save(parsed.settings);
            }
            if (parsed.jot !== undefined) {
              localStorage.setItem('bench_jot', parsed.jot);
            }
            ToastService.show('Data restored successfully.', 'success');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      } catch (err) {
        console.error(err);
        ToastService.show('Failed to restore backup.', 'error');
      }
    });
  }

  // Danger Zone actions
  const clearArchiveBtn = container.querySelector('#settings-danger-clear-archive');
  const clearDatabaseBtn = container.querySelector('#settings-danger-clear-database');

  if (clearArchiveBtn) {
    clearArchiveBtn.addEventListener('click', () => {
      DialogService.confirm({
        title: 'Clear Archive',
        message: 'Are you sure you want to permanently delete all archived projects, tasks, and areas? This action cannot be undone.',
        confirmText: 'Clear Archive',
        cancelText: 'Cancel',
        variant: 'danger'
      }).then((confirmed) => {
        if (confirmed) {
          Repository.clearModule('archive');
          // Also clear archived areas
          Repository.getAreas().forEach(area => {
            if (area.archived) {
              Repository.deleteAreaForce(area.id, null);
            }
          });
          ToastService.show('Archive cleared successfully.', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
    });
  }

  if (clearDatabaseBtn) {
    clearDatabaseBtn.addEventListener('click', () => {
      DialogService.confirm({
        title: 'Clear Database',
        message: 'Are you sure you want to permanently wipe the entire database? This will delete all tasks, projects, areas, and checklists. This action cannot be undone.',
        confirmText: 'Wipe Everything',
        cancelText: 'Cancel',
        variant: 'danger'
      }).then((confirmed) => {
        if (confirmed) {
          Repository._saveRaw([]);
          ToastService.show('Database cleared successfully.', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
    });
  }
}
