/**
 * Dark Mode Toggle System
 * Manages theme switching with localStorage persistence
 */

class DarkModeManager {
    constructor() {
        this.body = document.body;
        this.toggleButton = null;
        this.toggleIcon = null;
        this.currentTheme = 'light';
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.toggleButton = document.getElementById('darkModeToggle');
        
        if (!this.toggleButton) {
            console.warn('Dark mode toggle button not found');
            return;
        }
        
        this.toggleIcon = this.toggleButton.querySelector('.toggle-icon');
        
        // Load saved theme or detect system preference
        this.loadTheme();
        
        // Set up event listeners
        this.toggleButton.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        
        // Update body classes
        this.body.classList.remove('light-mode', 'dark-mode');
        this.body.classList.add(`${theme}-mode`);
        
        // Update toggle icon
        if (this.toggleIcon) {
            this.toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            this.toggleButton.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add a subtle animation effect
        this.toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.toggleButton.style.transform = 'scale(1)';
        }, 150);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Initialize dark mode manager
const darkModeManager = new DarkModeManager();

// Export for potential use by other scripts
window.DarkModeManager = darkModeManager;