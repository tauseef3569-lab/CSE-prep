// ===== STORAGE MODULE =====
// Handles all localStorage operations including save, load, export, import

const Storage = {
    // Storage keys
    KEYS: {
        CHAPTERS: 'csePrep_chapters',
        PERSONAL_TASKS: 'csePrep_personalTasks',
        SCHEDULE: 'csePrep_schedule',
        SETTINGS: 'csePrep_settings',
        ACTIVITY: 'csePrep_activity',
        FRIEND_DATA: 'csePrep_friendData'
    },

    // Initialize storage with defaults
    init() {
        // Load or initialize chapters
        if (!this.get(Storage.KEYS.CHAPTERS)) {
            this.save(Storage.KEYS.CHAPTERS, DEFAULT_CHAPTERS);
        }

        // Load or initialize personal tasks
        if (!this.get(Storage.KEYS.PERSONAL_TASKS)) {
            this.save(Storage.KEYS.PERSONAL_TASKS, DEFAULT_PERSONAL_TASKS);
        }

        // Initialize schedule if not exists
        if (!this.get(Storage.KEYS.SCHEDULE)) {
            this.save(Storage.KEYS.SCHEDULE, this.createInitialSchedule());
        }

        // Initialize activity log
        if (!this.get(Storage.KEYS.ACTIVITY)) {
            this.save(Storage.KEYS.ACTIVITY, []);
        }
    },

    // Generic get
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    // Generic save
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    // Remove key
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Clear all app data
    clearAll() {
        Object.values(Storage.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Get chapters
    getChapters() {
        return this.get(Storage.KEYS.CHAPTERS) || DEFAULT_CHAPTERS;
    },

    // Save chapters
    saveChapters(chapters) {
        return this.save(Storage.KEYS.CHAPTERS, chapters);
    },

    // Get personal tasks
    getPersonalTasks() {
        return this.get(Storage.KEYS.PERSONAL_TASKS) || DEFAULT_PERSONAL_TASKS;
    },

    // Save personal tasks
    savePersonalTasks(tasks) {
        return this.save(Storage.KEYS.PERSONAL_TASKS, tasks);
    },

    // Get schedule
    getSchedule() {
        return this.get(Storage.KEYS.SCHEDULE) || this.createInitialSchedule();
    },

    // Save schedule
    saveSchedule(schedule) {
        return this.save(Storage.KEYS.SCHEDULE, schedule);
    },

    // Get settings
    getSettings() {
        return this.get(Storage.KEYS.SETTINGS) || {
            darkMode: false,
            animationsEnabled: true,
            notificationsEnabled: true
        };
    },

    // Save settings
    saveSettings(settings) {
        return this.save(Storage.KEYS.SETTINGS, settings);
    },

    // Get activity log
    getActivity() {
        return this.get(Storage.KEYS.ACTIVITY) || [];
    },

    // Add activity entry
    addActivity(type, description, details = {}) {
        const activities = this.getActivity();
        const activity = {
            id: Date.now(),
            type,
            description,
            details,
            timestamp: new Date().toISOString()
        };
        activities.unshift(activity);
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.pop();
        }
        return this.save(Storage.KEYS.ACTIVITY, activities);
    },

    // Export all data as JSON
    exportData() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                chapters: this.getChapters(),
                personalTasks: this.getPersonalTasks(),
                schedule: this.getSchedule(),
                settings: this.getSettings(),
                activity: this.getActivity().slice(0, 20) // Export recent 20 activities
            }
        };
        return JSON.stringify(exportData, null, 2);
    },

    // Import data from JSON string
    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);

            if (!imported.data || !imported.data.chapters || !imported.data.personalTasks) {
                return { success: false, error: 'Invalid data format' };
            }

            // Validate and import
            this.saveChapters(imported.data.chapters);
            this.savePersonalTasks(imported.data.personalTasks);

            if (imported.data.schedule) {
                this.saveSchedule(imported.data.schedule);
            }

            if (imported.data.settings) {
                this.saveSettings(imported.data.settings);
            }

            if (imported.data.activity) {
                this.save(Storage.KEYS.ACTIVITY, imported.data.activity);
            }

            // Log import activity
            this.addActivity('import', 'Data imported successfully', {
                importedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, error: 'Failed to parse import data' };
        }
    },

    // Store friend's data for comparison
    saveFriendData(friendData) {
        return this.save(Storage.KEYS.FRIEND_DATA, friendData);
    },

    // Get friend's data
    getFriendData() {
        return this.get(Storage.KEYS.FRIEND_DATA);
    },

    // Generate a simple shareable code (compressed base64)
    generateShareCode() {
        const data = this.exportData();
        // Simple encoding: base64 + remove padding + compress
        const base64 = btoa(data);
        // Create short code (8 characters from the hash)
        const hash = this.simpleHash(base64);
        return hash.substring(0, 8).toUpperCase();
    },

    // Decode share code to data
    decodeShareCode(code) {
        // This is a simplified implementation
        // In a real app, you'd have a server to map codes to data
        // For now, we'll prompt user to upload JSON instead
        return null;
    },

    // Simple hash function
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },

    // Create initial schedule (8 weeks)
    createInitialSchedule() {
        const schedule = {};
        const today = new Date();
        const startOfWeek = this.getStartOfWeek(today);

        // Create 8 weeks of schedule
        for (let week = 0; week < 8; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + (week * 7) + day);
                const dateKey = this.formatDateKey(date);

                schedule[dateKey] = {
                    date: dateKey,
                    displayDate: this.formatDisplayDate(date),
                    sessions: []
                };
            }
        }

        return schedule;
    },

    // Format date key (YYYY-MM-DD)
                                                                                                  formatDateKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Get start of week (Monday)
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    // Format display date (e.g., "Mon, 15")
    formatDisplayDate(date) {
        const d = new Date(date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}`;
    },

    // Download file helper
    downloadFile(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
