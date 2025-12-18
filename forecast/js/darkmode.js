/**
 * Dark Mode Toggle Functionality
 */

class DarkModeManager {
    constructor() {
        this.themeKey = 'forecast-theme';
        this.currentTheme = this.getStoredTheme();
        this.themeToggle = null;
        
        this.init();
    }

    init() {
        // Apply stored theme immediately
        this.applyTheme(this.currentTheme);
        
        // Setup toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }

    setupToggle() {
        this.themeToggle = document.getElementById('themeToggle');
        
        if (this.themeToggle) {
            // Set initial icon
            this.updateToggleIcon();
            
            // Add click event listener
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            console.log('✅ Dark mode toggle initialized');
        } else {
            console.warn('⚠️ Theme toggle button not found');
        }
    }

    getStoredTheme() {
        // Check localStorage first
        const stored = localStorage.getItem(this.themeKey);
        if (stored) {
            return stored;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Default to light
        return 'light';
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        
        this.currentTheme = theme;
        
        // Store preference
        localStorage.setItem(this.themeKey, theme);
        
        console.log(`🎨 Theme applied: ${theme}`);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateToggleIcon();
        
        // Add visual feedback
        this.addToggleFeedback();
        
        console.log(`🔄 Theme toggled to: ${newTheme}`);
    }

    updateToggleIcon() {
        if (!this.themeToggle) return;
        
        if (this.currentTheme === 'dark') {
            this.themeToggle.textContent = '☀️';
            this.themeToggle.title = 'Switch to Light Mode';
        } else {
            this.themeToggle.textContent = '🌙';
            this.themeToggle.title = 'Switch to Dark Mode';
        }
    }

    addToggleFeedback() {
        if (!this.themeToggle) return;
        
        // Add animation class
        this.themeToggle.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    // Listen for system theme changes
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const hasManualPreference = localStorage.getItem(this.themeKey);
                
                if (!hasManualPreference) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                    this.updateToggleIcon();
                    
                    console.log(`🔄 System theme changed to: ${systemTheme}`);
                }
            });
        }
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Force set theme (for external use)
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
            this.updateToggleIcon();
        }
    }
}

// Initialize dark mode manager
const darkMode = new DarkModeManager();

// Watch for system theme changes
darkMode.watchSystemTheme();

// Export for external use
window.DarkMode = darkMode;