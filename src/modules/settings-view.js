import { SettingsStore } from '../core/settings-store.js';

export function renderSettingsView(container) {
  const settings = SettingsStore.load();

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
                <input type="checkbox" id="settings-compact" style="cursor: pointer;" ${settings.compactMode ? 'checked' : ''}>
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
                <input type="checkbox" id="settings-reduce-animations" style="cursor: pointer;" ${settings.reduceAnimations ? 'checked' : ''}>
              </div>
            </div>

            <div class="settings-subheader" style="margin-top: var(--space-md);">Behavior</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Confirm before deleting</span>
                <input type="checkbox" id="settings-confirm-delete" style="cursor: pointer;" ${settings.confirmDelete ? 'checked' : ''}>
              </div>

              <div class="settings-item">
                <span class="settings-label">Confirm before archiving</span>
                <input type="checkbox" id="settings-confirm-archive" style="cursor: pointer;" ${settings.confirmArchive ? 'checked' : ''}>
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
                <input type="checkbox" id="settings-remember-last-module" style="cursor: pointer;" ${settings.rememberLastModule ? 'checked' : ''}>
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
                <input type="checkbox" style="cursor: pointer;" disabled>
              </div>
              <div class="settings-item">
                <span class="settings-label">Focus session duration</span>
                <select class="inspector-select" style="width: 140px; padding: 2px 4px; border: 1px solid var(--color-border);" disabled>
                  <option value="25">25 minutes</option>
                </select>
              </div>
            </div>

            <div class="settings-subheader" style="margin-top: var(--space-md);">Areas</div>
            <div class="settings-list">
              <div class="settings-item">
                <span class="settings-label">Confirm before archiving Area</span>
                <input type="checkbox" style="cursor: pointer;" disabled checked>
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
                <input type="checkbox" style="cursor: pointer;" disabled checked>
              </div>
            </div>
            
          </div>
        </div>

        <!-- Data -->
        <div>
          <div class="completed-header">Data</div>
          <div class="settings-list">
            <div class="settings-item action-item">
              <span class="settings-label">Import</span>
              <span class="settings-action-text">import JSON</span>
            </div>
            <div class="settings-item action-item">
              <span class="settings-label">Export</span>
              <span class="settings-action-text">export JSON</span>
            </div>
            <div class="settings-item action-item">
              <span class="settings-label">Backup</span>
              <span class="settings-action-text">create backup</span>
            </div>
            <div class="settings-item action-item">
              <span class="settings-label">Restore</span>
              <span class="settings-action-text">restore backup</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div>
          <div class="completed-header" style="color: var(--color-danger);">Danger Zone</div>
          <div class="settings-list" style="border-left-color: rgba(247, 118, 142, 0.2);">
            <div class="settings-item action-item">
              <span class="settings-label" style="color: var(--color-danger);">Clear Archive</span>
              <span class="settings-action-text" style="color: var(--color-danger);">clear</span>
            </div>
            <div class="settings-item action-item">
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
              <span class="settings-value">DeepMind Team</span>
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
}
