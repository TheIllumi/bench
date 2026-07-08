export function renderSettingsView(container) {
  container.innerHTML = `
    <div class="focus-container settings-view">
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- General -->
        <div>
          <div class="completed-header">General</div>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">Appearance</span>
              <span class="settings-value">Dark Mode</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Behavior</span>
              <span class="settings-value">Default</span>
            </div>
          </div>
        </div>

        <!-- Productivity -->
        <div>
          <div class="completed-header">Productivity</div>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">Focus</span>
              <span class="settings-value">Active (3 tasks max)</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Areas</span>
              <span class="settings-value">Active</span>
            </div>
            <div class="settings-item">
              <span class="settings-label">Jot</span>
              <span class="settings-value">Active</span>
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
}
