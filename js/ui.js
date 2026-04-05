// ===== UI MODULE =====
// Handles all DOM manipulation and component rendering

const UI = {
    // Currently filtered chapters
    chapterFilter: 'all',

    // Initialize UI
    init() {
        this.setupEventListeners();
        this.renderAll();
        this.updateThemeToggle();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Close settings modal
        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeModal('settings-modal');
        });

        // Close detail modal
        document.getElementById('close-detail').addEventListener('click', () => {
            this.closeModal('detail-modal');
        });

        // Close add task modal
        document.getElementById('close-add-task').addEventListener('click', () => {
            this.closeModal('add-task-modal');
        });

        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openAddTaskModal();
        });

        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Chapter filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterChapters(filter);
            });
        });

        // Schedule controls
        document.getElementById('prev-week').addEventListener('click', () => {
            this.navigateWeek(-1);
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.navigateWeek(1);
        });

        document.getElementById('add-schedule-btn').addEventListener('click', () => {
            Schedule.addSessionModal();
        });

        // Sharing buttons
        document.getElementById('export-btn').addEventListener('click', () => {
            Sharing.exportData();
        });

        document.getElementById('generate-qr-btn').addEventListener('click', () => {
            Sharing.generateQRCode();
        });

        document.getElementById('import-code-btn').addEventListener('click', () => {
            const code = document.getElementById('share-code-input').value;
            if (code) {
                Sharing.importFriendByCode(code);
            } else {
                UI.showToast('Please enter a share code', 'warning');
            }
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                Sharing.importFriendFromFile(file);
            }
        });

        document.getElementById('clear-comparison-btn').addEventListener('click', () => {
            Sharing.clearComparison();
        });

        // Settings actions
        document.getElementById('backup-btn').addEventListener('click', () => {
            Sharing.exportData();
        });

        document.getElementById('restore-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    Sharing.importDataFromFile(file);
                }
            };
            input.click();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This action cannot be undone!')) {
                Storage.clearAll();
                location.reload();
            }
        });

        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            this.toggleTheme(e.target.checked);
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },

    // Render all components
    renderAll() {
        this.renderDashboard();
        this.renderChapters();
        this.renderTasks();
        this.renderSchedule();
        this.renderWeekGoals();
        this.renderActivityFeed();
        this.updateProgressBars();
    },

    // Switch between tabs
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId + '-tab');
        });

        // Refresh animations when switching tabs
        setTimeout(() => {
            Animations.refresh();
        }, 100);
    },

    // Render dashboard stats
    renderDashboard() {
        const overallProgress = Progress.calculateOverall();
        const chapterProgress = Progress.calculateChapterProgress();
        const taskProgress = Progress.calculateTaskProgress();
        const weightageCounts = Progress.getWeightageCounts();
        const priorityCounts = Progress.getPriorityCounts();
        const totalHours = Progress.getTotalStudyHours();

        // Overall progress circle
        const circle = document.getElementById('overall-progress-circle');
        const percentage = document.getElementById('overall-percentage');
        if (circle) {
            const circumference = 2 * Math.PI * 90;
            const offset = circumference - (overallProgress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            circle.dataset.progress = overallProgress;
        }
        if (percentage) percentage.textContent = overallProgress + '%';

        // Stats
        const chaptersCompleted = Storage.getChapters().filter(c => c.completed).length;
        document.getElementById('chapters-completed').textContent =
            `${chaptersCompleted}/${weightageCounts.total}`;
        document.getElementById('tasks-completed').textContent =
            `${priorityCounts.completed}/${priorityCounts.total}`;
        document.getElementById('total-hours').textContent = totalHours + 'h';

        // Chapter progress
        const chapterBar = document.getElementById('chapter-progress-bar');
        if (chapterBar) {
            chapterBar.style.width = chapterProgress + '%';
        }
        document.getElementById('chapter-progress-text').textContent = chapterProgress + '%';

        // Weightage badges
        document.getElementById('high-weight-badge').textContent = `${weightageCounts.high} High`;
        document.getElementById('high-weight-count').textContent = weightageCounts.high;
        document.getElementById('medium-weight-count').textContent = weightageCounts.medium;
        document.getElementById('low-weight-count').textContent = weightageCounts.low;

        // Tasks progress
        const tasksBar = document.getElementById('tasks-progress-bar');
        if (tasksBar) {
            tasksBar.style.width = taskProgress + '%';
        }
        document.getElementById('tasks-progress-text').textContent = taskProgress + '%';

        // Priority counts
        document.getElementById('priority-badge').textContent = `${priorityCounts.pending} Pending`;
        document.getElementById('high-priority-count').textContent = priorityCounts.high;
        document.getElementById('medium-priority-count').textContent = priorityCounts.medium;
        document.getElementById('low-priority-count').textContent = priorityCounts.low;
    },

    // Update all progress bars
    updateProgressBars() {
        this.renderDashboard();

        // Update tasks mini circle
        const taskProgress = Progress.calculateTaskProgress();
        const circle = document.getElementById('tasks-mini-circle');
        const percent = document.getElementById('tasks-mini-percent');
        if (circle) {
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (taskProgress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
        if (percent) percent.textContent = taskProgress + '%';

        // Update weekly progress
        const weekGoals = Progress.getWeeklyGoals();
        const weekCompleted = weekGoals.filter(g => g.completed).length;
        const weekTotal = weekGoals.length;
        const weekProgress = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

        const weekFill = document.getElementById('weekly-progress-fill');
        const weekText = document.getElementById('weekly-progress-text');
        if (weekFill) weekFill.style.width = weekProgress + '%';
        if (weekText) weekText.textContent = `${weekCompleted}/${weekTotal} weekly goals (${weekProgress}%)`;

        // Update badge
        document.getElementById('week-badge').textContent = weekGoals.length + ' Goals';
    },

    // Render chapters grid
    renderChapters() {
        const container = document.getElementById('chapters-grid');
        if (!container) return;

        let chapters = Storage.getChapters();
        const filter = this.chapterFilter;

        // Apply filter
        if (filter === 'high') {
            chapters = chapters.filter(c => c.weightage === 'high');
        } else if (filter === 'medium') {
            chapters = chapters.filter(c => c.weightage === 'medium');
        } else if (filter === 'low') {
            chapters = chapters.filter(c => c.weightage === 'low');
        } else if (filter === 'incomplete') {
            chapters = chapters.filter(c => !c.completed);
        }

        if (chapters.length === 0) {
            container.innerHTML = `
                <div class="empty-chapters">
                    <i class="fas fa-book-reader"></i>
                    <h3>No chapters found</h3>
                    <p>Try adjusting your filter or add new chapters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = chapters.map(chapter => {
            const progress = Progress.getChapterProgress(chapter);
            return `
                <div class="chapter-card ${chapter.weightage}-weight ${chapter.completed ? 'completed' : ''}"
                     data-chapter-id="${chapter.id}">
                    <div class="chapter-header">
                        <h3 class="chapter-title">${chapter.name}</h3>
                        <div class="chapter-weightage">
                            <span class="weightage-badge ${chapter.weightage}">${chapter.weightage}</span>
                        </div>
                    </div>
                    <div class="chapter-meta">
                        <span><i class="fas fa-calendar"></i> ${chapter.totalDays} days</span>
                        <span><i class="fas fa-check-circle"></i> ${chapter.completedDays || 0}/${chapter.totalDays}</span>
                        ${chapter.completed ? '<span class="badge badge-success"><i class="fas fa-check"></i> Done</span>' : ''}
                    </div>
                    <div class="chapter-progress-container">
                        <div class="chapter-progress-bar">
                            <div class="chapter-progress-fill ${progress > 0 ? 'animated' : ''}"
                                 style="width: ${progress}%"></div>
                        </div>
                        <span class="chapter-progress-text">${progress}% Complete</span>
                    </div>
                    <div class="chapter-actions">
                        <button class="btn-action ${chapter.completed ? '' : 'completed'}"
                                onclick="Progress.toggleChapter('${chapter.id}')"
                                data-tooltip="${chapter.completed ? 'Mark incomplete' : 'Mark complete'}">
                            <i class="fas fa-${chapter.completed ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="btn-action"
                                onclick="UI.showChapterDetail('${chapter.id}')"
                                data-tooltip="Details">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="btn-action danger"
                                onclick="UI.deleteChapter('${chapter.id}')"
                                data-tooltip="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render personal tasks
    renderTasks() {
        const tasks = Storage.getPersonalTasks();
        const pendingTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        const pendingContainer = document.getElementById('pending-tasks');
        const completedContainer = document.getElementById('completed-tasks');

        if (pendingContainer) {
            pendingContainer.innerHTML = pendingTasks.map(task => this.renderTaskCard(task)).join('');
            document.getElementById('pending-count').textContent = pendingTasks.length;
        }

        if (completedContainer) {
            completedContainer.innerHTML = completedTasks.map(task => this.renderTaskCard(task)).join('');
            document.getElementById('completed-count').textContent = completedTasks.length;
        }
    },

    // Render single task card
    renderTaskCard(task) {
        const dueDate = task.dueDate ?
            new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
            'No due date';

        return `
            <div class="task-card ${task.priority}-priority ${task.completed ? 'completed' : ''}"
                 data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="Progress.toggleTask('${task.id}')">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        <div class="task-meta">
                            <span><i class="fas fa-flag"></i> ${task.priority}</span>
                            <span><i class="fas fa-calendar"></i> ${dueDate}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn"
                            onclick="UI.editTask('${task.id}')"
                            data-tooltip="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete"
                            onclick="Progress.deleteTask('${task.id}')"
                            data-tooltip="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    // Render schedule
    renderSchedule(weekOffset = 0) {
        Schedule.renderCalendar('calendar-grid', weekOffset);
    },

    // Navigate week
    navigateWeek(delta) {
        const currentOffset = Schedule.currentWeekOffset || 0;
        this.renderSchedule(currentOffset + delta);
    },

    // Render weekly goals
    renderWeekGoals() {
        const container = document.getElementById('week-goals-container');
        const goals = Progress.getWeeklyGoals();

        if (goals.length === 0) {
            container.innerHTML = '<p class="empty-state" style="padding: 1rem;">No tasks due this week</p>';
            return;
        }

        container.innerHTML = goals.map(task => `
            <div class="week-goal-item ${task.completed ? 'completed' : ''}">
                <div class="week-checkbox ${task.completed ? 'checked' : ''}"
                     onclick="Progress.toggleTask('${task.id}')">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span>${task.title}</span>
            </div>
        `).join('');
    },

    // Render activity feed
    renderActivityFeed() {
        const container = document.getElementById('activity-feed');
        const activities = Storage.getActivity().slice(0, 10);

        if (activities.length === 0) {
            container.innerHTML = '<p class="empty-state">No activity yet. Start studying!</p>';
            return;
        }

        container.innerHTML = activities.map(activity => {
            const time = new Date(activity.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            const icons = {
                chapter_complete: 'fa-book-open',
                chapter_progress: 'fa-chart-line',
                chapter_reopen: 'fa-undo',
                chapter_delete: 'fa-trash',
                task_complete: 'fa-check-circle',
                task_create: 'fa-plus',
                task_update: 'fa-edit',
                task_delete: 'fa-trash',
                task_reopen: 'fa-redo',
                session_create: 'fa-calendar-plus',
                session_update: 'fa-edit',
                session_move: 'fa-exchange-alt',
                import: 'fa-download',
                export: 'fa-upload'
            };

            const icon = icons[activity.type] || 'fa-info-circle';

            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.description}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Filter chapters
    filterChapters(filter) {
        this.chapterFilter = filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Re-render chapters
        this.renderChapters();
    },

    // Show chapter detail modal
    showChapterDetail(chapterId) {
        const chapter = Storage.getChapters().find(c => c.id === chapterId);
        if (!chapter) return;

        const modal = document.getElementById('detail-modal');
        const title = document.getElementById('detail-title');
        const body = document.getElementById('detail-body');

        title.innerHTML = `<i class="fas fa-book-open"></i> ${chapter.name}`;

        body.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Overview</h3>
                <div class="detail-list">
                    <li>
                        <span class="detail-label">Weightage</span>
                        <span class="detail-value"><span class="badge badge-${chapter.weightage}">${chapter.weightage}</span></span>
                    </li>
                    <li>
                        <span class="detail-label">Progress</span>
                        <span class="detail-value">${chapter.completedDays}/${chapter.totalDays} days</span>
                    </li>
                    <li>
                        <span class="detail-label">Status</span>
                        <span class="detail-value">${chapter.completed ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-info">In Progress</span>'}</span>
                    </li>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-list"></i> Subtopics</h3>
                <ul class="detail-list">
                    ${chapter.subtopics.map(topic => `
                        <li ${topic.completed ? 'class="completed"' : ''}>
                            <span>${topic}</span>
                            ${topic.completed ? '<i class="fas fa-check-circle" style="color: var(--success)"></i>' : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-cog"></i> Actions</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="Progress.toggleChapter('${chapter.id}'); UI.closeModal('detail-modal');"
                            class="btn ${chapter.completed ? 'btn-secondary' : 'btn-primary'}">
                        <i class="fas fa-${chapter.completed ? 'undo' : 'check'}"></i>
                        ${chapter.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button onclick="UI.adjustChapterDays('${chapter.id}')" class="btn btn-secondary">
                        <i class="fas fa-plus-minus"></i> Adjust Days
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    // Adjust chapter days
    adjustChapterDays(chapterId) {
        const chapter = Storage.getChapters().find(c => c.id === chapterId);
        if (!chapter) return;

        const newDays = prompt(
            `Enter completed days (0-${chapter.totalDays}):`,
            chapter.completedDays || 0
        );

        if (newDays !== null) {
            const days = parseInt(newDays);
            if (!isNaN(days) && days >= 0 && days <= chapter.totalDays) {
                chapter.completedDays = days;
                chapter.completed = days >= chapter.totalDays;
                Storage.saveChapters(Storage.getChapters());
                this.closeModal('detail-modal');
                this.showChapterDetail(chapterId); // Refresh modal
                this.renderAll();
            } else {
                alert(`Please enter a number between 0 and ${chapter.totalDays}`);
            }
        }
    },

    // Open add task modal
    openAddTaskModal() {
        document.getElementById('task-form').reset();
        document.getElementById('add-task-modal').classList.add('active');
    },

    // Handle task form submit
    handleTaskSubmit() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        Progress.addTask({
            title,
            description,
            priority,
            dueDate: dueDate || null
        });

        this.closeModal('add-task-modal');
        this.showToast('Task added successfully!', 'success');
    },

    // Edit task
    editTask(taskId) {
        const task = Storage.getPersonalTasks().find(t => t.id === taskId);
        if (!task) return;

        // For simplicity, we'll just prompt for updates
        // In a full implementation, would open an edit modal
        const newTitle = prompt('Update title:', task.title);
        if (newTitle && newTitle.trim()) {
            Progress.updateTask(taskId, { title: newTitle.trim() });
            this.showToast('Task updated', 'success');
        }
    },

    // Delete chapter
    deleteChapter(chapterId) {
        if (confirm('Delete this chapter? This cannot be undone.')) {
            Progress.deleteChapter(chapterId);
            this.showToast('Chapter deleted', 'success');
        }
    },

    // Toggle theme
    toggleTheme(forceDark = null) {
        const body = document.body;
        const icon = document.querySelector('#theme-toggle i');
        const toggle = document.getElementById('dark-mode-toggle');

        const isDark = forceDark !== null ? forceDark : !body.classList.contains('dark-theme');

        if (isDark) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (icon) icon.className = 'fas fa-sun';
            if (toggle) toggle.checked = true;
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (icon) icon.className = 'fas fa-moon';
            if (toggle) toggle.checked = false;
        }

        // Save preference
        const settings = Storage.getSettings();
        settings.darkMode = isDark;
        Storage.saveSettings(settings);
    },

    // Update theme toggle icon
    updateThemeToggle() {
        const settings = Storage.getSettings();
        const body = document.body;
        const icon = document.querySelector('#theme-toggle i');
        const toggle = document.getElementById('dark-mode-toggle');

        if (settings.darkMode) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (icon) icon.className = 'fas fa-sun';
            if (toggle) toggle.checked = true;
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (icon) icon.className = 'fas fa-moon';
            if (toggle) toggle.checked = false;
        }
    },

    // Open settings modal
    openSettings() {
        document.getElementById('settings-modal').classList.add('active');
    },

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
