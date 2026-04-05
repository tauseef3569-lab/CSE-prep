// ===== PROGRESS MODULE =====
// Handles all progress calculations and updates

const Progress = {
    // Calculate overall progress
    calculateOverall() {
        const chapterProgress = this.calculateChapterProgress();
        const taskProgress = this.calculateTaskProgress();
        const scheduleProgress = this.calculateScheduleProgress();

        // Weighted average: chapters (50%), tasks (30%), schedule (20%)
        const overall = (
            chapterProgress * 0.5 +
            taskProgress * 0.3 +
            scheduleProgress * 0.2
        );

        return Math.round(overall);
    },

    // Calculate chapter progress (based on completed subtopics/days)
    calculateChapterProgress() {
        const chapters = Storage.getChapters();
        if (chapters.length === 0) return 0;

        const totalProgress = chapters.reduce((sum, chapter) => {
            const progress = this.getChapterProgress(chapter);
            return sum + progress;
        }, 0);

        return Math.round(totalProgress / chapters.length);
    },

    // Get individual chapter progress
    getChapterProgress(chapter) {
        // If chapter is manually marked complete, return 100%
        if (chapter.completed) return 100;

        // Calculate based on completedDays / totalDays
        const completedDays = chapter.completedDays || 0;
        const totalDays = chapter.totalDays || 1; // Avoid division by zero

        const progress = Math.min(100, Math.round((completedDays / totalDays) * 100));
        return progress;
    },

    // Calculate personal tasks progress
    calculateTaskProgress() {
        const tasks = Storage.getPersonalTasks();
        if (tasks.length === 0) return 0;

        const completedCount = tasks.filter(t => t.completed).length;
        return Math.round((completedCount / tasks.length) * 100);
    },

    // Calculate schedule progress (based on completed study hours vs planned)
    calculateScheduleProgress() {
        const schedule = Storage.getSchedule();
        const chapters = Storage.getChapters();

        let totalPlanned = 0;
        let totalCompleted = 0;

        Object.values(schedule).forEach(day => {
            day.sessions.forEach(session => {
                totalPlanned += session.hours || 0;
                totalCompleted += session.completedHours || 0;
            });
        });

        if (totalPlanned === 0) return 0;

        return Math.round((totalCompleted / totalPlanned) * 100);
    },

    // Get weightage counts
    getWeightageCounts() {
        const chapters = Storage.getChapters();
        return {
            high: chapters.filter(c => c.weightage === 'high').length,
            medium: chapters.filter(c => c.weightage === 'medium').length,
            low: chapters.filter(c => c.weightage === 'low').length,
            total: chapters.length
        };
    },

    // Get priority counts for tasks
    getPriorityCounts() {
        const tasks = Storage.getPersonalTasks();
        const pending = tasks.filter(t => !t.completed);
        const completed = tasks.filter(t => t.completed);

        return {
            total: tasks.length,
            pending: pending.length,
            completed: completed.length,
            high: pending.filter(t => t.priority === 'high').length,
            medium: pending.filter(t => t.priority === 'medium').length,
            low: pending.filter(t => t.priority === 'low').length,
            highTotal: tasks.filter(t => t.priority === 'high').length,
            mediumTotal: tasks.filter(t => t.priority === 'medium').length,
            lowTotal: tasks.filter(t => t.priority === 'low').length
        };
    },

    // Update chapter progress by incrementing/decrementing completed days
    updateChapterProgress(chapterId, increment = true, days = 1) {
        const chapters = Storage.getChapters();
        const chapter = chapters.find(c => c.id === chapterId);

        if (!chapter) return false;

        if (increment) {
            chapter.completedDays = Math.min(
                chapter.totalDays,
                (chapter.completedDays || 0) + days
            );
            if (chapter.completedDays >= chapter.totalDays) {
                chapter.completed = true;
                Storage.addActivity('chapter_complete', `Completed chapter: ${chapter.name}`);
            } else {
                Storage.addActivity('chapter_progress', `Updated ${chapter.name}: ${chapter.completedDays}/${chapter.totalDays}`);
            }
        } else {
            chapter.completedDays = Math.max(0, (chapter.completedDays || 0) - days);
            chapter.completed = false;
            Storage.addActivity('chapter_progress', `Adjusted ${chapter.name}: ${chapter.completedDays}/${chapter.totalDays}`);
        }

        const saved = Storage.saveChapters(chapters);
        // Refresh UI
        if (saved && window.UI) {
            UI.renderAll();
        }
        return saved;
    },

    // Toggle chapter completion
    toggleChapter(chapterId) {
        const chapters = Storage.getChapters();
        const chapter = chapters.find(c => c.id === chapterId);

        if (!chapter) return false;

        chapter.completed = !chapter.completed;
        if (chapter.completed) {
            chapter.completedDays = chapter.totalDays;
            Storage.addActivity('chapter_complete', `Marked complete: ${chapter.name}`);
        } else {
            chapter.completedDays = 0;
            Storage.addActivity('chapter_reopen', `Reopened chapter: ${chapter.name}`);
        }

        const saved = Storage.saveChapters(chapters);
        // Refresh UI
        if (saved && window.UI) {
            UI.renderAll();
        }
        return saved;
    },

    // Toggle personal task completion
    toggleTask(taskId) {
        const tasks = Storage.getPersonalTasks();
        const task = tasks.find(t => t.id === taskId);

        if (!task) return false;

        task.completed = !task.completed;
        if (task.completed) {
            Storage.addActivity('task_complete', `Completed task: ${task.title}`);
        } else {
            Storage.addActivity('task_reopen', `Reopened task: ${task.title}`);
        }

        const saved = Storage.savePersonalTasks(tasks);
        // Refresh UI
        if (saved && window.UI) {
            UI.renderAll();
        }
        return saved;
    },

    // Delete task
    deleteTask(taskId) {
        const tasks = Storage.getPersonalTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        Storage.savePersonalTasks(filtered);
        Storage.addActivity('task_delete', `Deleted task ID: ${taskId}`);
        // Refresh UI
        if (window.UI) {
            UI.renderAll();
        }
    },

    // Add new personal task
    addTask(taskData) {
        const tasks = Storage.getPersonalTasks();
        const newTask = {
            id: 'task-' + Date.now(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        Storage.savePersonalTasks(tasks);
        Storage.addActivity('task_create', `Created task: ${taskData.title}`);
        // Refresh UI
        if (window.UI) {
            UI.renderAll();
        }
        return newTask;
    },

    // Update task
    updateTask(taskId, updates) {
        const tasks = Storage.getPersonalTasks();
        const task = tasks.find(t => t.id === taskId);

        if (!task) return false;

        Object.assign(task, updates);
        Storage.savePersonalTasks(tasks);
        Storage.addActivity('task_update', `Updated task: ${task.title}`);
        // Refresh UI
        if (window.UI) {
            UI.renderAll();
        }
        return true;
    },

    // Delete chapter (optional)
    deleteChapter(chapterId) {
        const chapters = Storage.getChapters();
        const filtered = chapters.filter(c => c.id !== chapterId);
        Storage.saveChapters(filtered);
        Storage.addActivity('chapter_delete', `Deleted chapter ID: ${chapterId}`);
        // Refresh UI
        if (window.UI) {
            UI.renderAll();
        }
    },

    // Get total study hours from schedule
    getTotalStudyHours() {
        const schedule = Storage.getSchedule();
        let total = 0;

        Object.values(schedule).forEach(day => {
            day.sessions.forEach(session => {
                total += session.completedHours || 0;
            });
        });

        return total;
    },

    // Update session completion
    updateSession(dateKey, sessionIndex, completedHours) {
        const schedule = Storage.getSchedule();
        if (!schedule[dateKey]) return false;

        schedule[dateKey].sessions[sessionIndex].completedHours = completedHours;

        // Auto-trigger chapter progress if session is fully completed
        const session = schedule[dateKey].sessions[sessionIndex];
        if (session.chapterId) {
            if (completedHours >= session.hours && !chapter.completed) {
                // Could trigger chapter completion check
            }
        }

        Storage.saveSchedule(schedule);
        Storage.addActivity('session_update', `Updated ${dateKey} session ${sessionIndex}: ${completedHours}h`);
        return true;
    },

    // Add session to schedule
    addSession(dateKey, sessionData) {
        const schedule = Storage.getSchedule();
        if (!schedule[dateKey]) return false;

        schedule[dateKey].sessions.push({
            id: 'session-' + Date.now(),
            chapterId: sessionData.chapterId || null,
            taskId: sessionData.taskId || null,
            title: sessionData.title,
            hours: sessionData.hours || 1,
            completedHours: 0,
            color: sessionData.color || null
        });

        Storage.saveSchedule(schedule);
        Storage.addActivity('session_create', `Added session on ${dateKey}: ${sessionData.title}`);
        return true;
    },

    // Get this week's days (Monday to Sunday)
    getCurrentWeekDays() {
        const schedule = Storage.getSchedule();
        const today = Storage.formatDateKey(new Date());
        const weekDays = [];

        // Find the Monday of current week
        let current = new Date();
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(current.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateKey = Storage.formatDateKey(date);
            weekDays.push({
                dateKey,
                displayDate: Storage.formatDisplayDate(date),
                dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                data: schedule[dateKey] || null
            });
        }

        return weekDays;
    },

    // Get weekly goals (tasks with due date this week)
    getWeeklyGoals() {
        const tasks = Storage.getPersonalTasks();
        const weekDays = this.getCurrentWeekDays();
        const weekStart = weekDays[0].dateKey;
        const weekEnd = weekDays[6].dateKey;

        return tasks.filter(task => {
            return task.dueDate && task.dueDate >= weekStart && task.dueDate <= weekEnd;
        });
    }
};
