// ===== MAIN APPLICATION ENTRY POINT =====
// Initializes all modules and starts the application

const App = {
    // Application state
    state: {
        initialized: false,
        currentTab: 'dashboard',
        currentWeek: 0,
        user: {
            name: 'Student',
            id: 'user-' + Date.now()
        }
    },

    // Initialize application
    init() {
        console.log('🚀 Initializing CSE Prep Master...');

        // Hide preloader after a short delay
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('hidden');
            }
        }, 1500);

        // Initialize storage
        Storage.init();
        console.log('✓ Storage initialized');

        // Initialize all modules
        Animations.init();
        console.log('✓ Animations initialized');

        UI.init();
        console.log('✓ UI initialized');

        // Set initial tab
        this.state.currentTab = localStorage.getItem('csePrep_lastTab') || 'dashboard';
        UI.switchTab(this.state.currentTab);

        // Set initial week (current week)
        this.state.currentWeek = 0;

        console.log('✓ Application ready!');
    },

    // Get app state
    getState() {
        return { ...this.state };
    },

    // Set app state
    setState(updates) {
        this.state = { ...this.state, ...updates };
    }
};

// ===== GLOBAL INITIALIZATION =====
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

// ===== UTILITY FUNCTIONS =====
// Make certain functions globally available for onclick handlers in HTML

// Expose needed functions to window for HTML event handlers
window.Progress = Progress;
window.Storage = Storage;
window.Schedule = Schedule;
window.Sharing = Sharing;
window.UI = UI;
window.Animations = Animations;

// Convenience shortcuts
window.toggleTheme = () => UI.toggleTheme();
window.showToast = (msg, type) => UI.showToast(msg, type);

// Print a helpful message to console
console.log(`
%c🎓 CSE Prep Master v1.0 %c
Welcome to your exam preparation tracker!

Tips:
- Use Dashboard for overview
- Track chapter progress in Chapters tab
- Manage personal tasks in Personal Tasks tab
- Schedule study sessions in Schedule tab
- Share progress with friends in Share tab

Made with ❤️ for your success!
`, 'color: #2ecc71; font-weight: bold; font-size: 16px;', 'color: #7f8c8d;');
