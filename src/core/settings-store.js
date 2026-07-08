const STORAGE_KEY = 'bench_settings';

const DEFAULT_SETTINGS = {
  theme: 'system',
  accentColor: 'blue',
  compactMode: false,
  fontSize: 'medium',
  reduceAnimations: false,
  
  // Behavior
  confirmDelete: true,
  confirmArchive: false,
  startupModule: 'focus',
  rememberLastModule: false,
  lastOpenedModule: 'focus'
};

export const SettingsStore = {
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  },

  save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.apply(settings);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  apply(settings) {
    const root = document.documentElement;

    // Apply Theme
    if (settings.theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      // System
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Apply Compact Mode
    root.setAttribute('data-compact', settings.compactMode ? 'true' : 'false');

    // Apply Font Size
    root.setAttribute('data-font-size', settings.fontSize);

    // Apply Reduce Animations
    root.setAttribute('data-reduce-animations', settings.reduceAnimations ? 'true' : 'false');
  },

  initialize() {
    const settings = this.load();
    this.apply(settings);

    // Listen to system theme changes if using 'system' theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = this.load();
      if (current.theme === 'system') {
        this.apply(current);
      }
    });
  }
};
