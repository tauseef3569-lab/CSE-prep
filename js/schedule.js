// ===== SCHEDULE MODULE =====
// Handles timetable, calendar display, and session management

const Schedule = {
    currentWeekOffset: 0,

    // Get week label
    getWeekLabel(offset = 0) {
        return `Week ${offset + 1}`;
    },

    // Get schedule for current week offset
    getWeekSchedule(offset = 0) {
        const schedule = Storage.getSchedule();
        const today = new Date();
        const startOfWeek = Storage.getStartOfWeek(today);

        // Calculate week start based on offset
        const weekStart = new Date(startOfWeek);
        weekStart.setDate(startOfWeek.getDate() + (offset * 7));

        const weekDays = [];

        for (let day = 0; day < 7; day++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + day);
            const dateKey = Storage.formatDateKey(date);
            const dayData = schedule[dateKey] || {
                date: dateKey,
                displayDate: Storage.formatDisplayDate(date),
                sessions: []
            };

            weekDays.push({
                dayIndex: day,
                dateKey,
                displayDate: dayData.displayDate,
                sessions: dayData.sessions || [],
                isWeekend: day === 0 || day === 6
            });
        }

        return weekDays;
    },

    // Render calendar grid
    renderCalendar(containerId, offset = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const weekData = this.getWeekSchedule(offset);
        this.currentWeekOffset = offset;

        // Update week label
        const weekLabel = document.getElementById('current-week-label');
        if (weekLabel) {
            weekLabel.textContent = this.getWeekLabel(offset);
        }

        // Build HTML
        let html = '<div class="week-row week-header">';

        // Days header
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        html += '<div class="time-slot-label">Time</div>';
        days.forEach((day, index) => {
            const isWeekend = index === 5 || index === 6;
            const dayData = weekData[index];
            html += `<div class="day-header ${isWeekend ? 'weekend' : ''}">
                ${day}<br>
                <small>${dayData.displayDate.split(', ')[1]}</small>
            </div>`;
        });
        html += '</div>';

        // Time slots (Morning, Afternoon, Evening)
        const timeSlots = [
            { label: '9-12 AM', sessionIndex: 0 },
            { label: '2-5 PM', sessionIndex: 1 },
            { label: '6-9 PM', sessionIndex: 2 }
        ];

        timeSlots.forEach(slot => {
            html += '<div class="week-row">';

            // Time label
            html += `<div class="time-slot-label">${slot.label}</div>`;

            // Each day's session for this time slot
            weekData.forEach((day, dayIndex) => {
                const session = day.sessions[slot.sessionIndex];
                const isWeekend = day.isWeekend;

                html += `<div class="day-column ${isWeekend ? 'weekend' : ''}"
                         data-date="${day.dateKey}"
                         data-slot="${slot.sessionIndex}"
                         data-chapter-id="${session?.chapterId || ''}"
                         ondragover="Schedule.handleDragOver(event)"
                         ondrop="Schedule.handleDrop(event, '${day.dateKey}', ${slot.sessionIndex})">`;

                if (session) {
                    const chapter = Storage.getChapters().find(c => c.id === session.chapterId);
                    const weightage = chapter ? chapter.weightage : 'low';
                    const color = this.getColorForWeightage(weightage);
                    const sessionColor = session.color || color;

                    html += `<div class="session-block"
                             style="--session-color: ${sessionColor}"
                             data-session-id="${session.id || ''}"
                             draggable="true"
                             ondragstart="Schedule.handleDragStart(event, '${day.dateKey}', ${slot.sessionIndex})"
                             onclick="Schedule.openSessionDetails('${day.dateKey}', ${slot.sessionIndex})">
                        ${session.title || (chapter ? chapter.name : 'Task')}
                        <br>
                        <small>${session.hours}h</small>
                    </div>`;
                }

                html += '</div>';
            });

            html += '</div>';
        });

        container.innerHTML = html;
    },

    // Get color for weightage
    getColorForWeightage(weightage) {
        const colors = {
            high: '#e74c3c',
            medium: '#f39c12',
            low: '#2ecc71'
        };
        return colors[weightage] || colors.medium;
    },

    // Handle drag start
    handleDragStart(event, dateKey, slotIndex) {
        event.dataTransfer.setData('text/plain', `${dateKey}|${slotIndex}`);
        event.target.classList.add('dragging');
    },

    // Handle drag over
    handleDragOver(event) {
        event.preventDefault();
        const column = event.target.closest('.day-column');
        if (column) {
            column.classList.add('drag-over');
        }
    },

    // Handle drop
    handleDrop(event, targetDate, targetSlot) {
        event.preventDefault();
        const column = event.target.closest('.day-column');
        if (column) {
            column.classList.remove('drag-over');
        }

        const data = event.dataTransfer.getData('text/plain');
        if (!data) return;

        const [sourceDate, sourceSlot] = data.split('|').map(Number);

        // Move session from source to target
        this.moveSession(sourceDate, sourceSlot, targetDate, targetSlot);

        // Clean up dragging class
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    },

    // Move session between slots
    moveSession(fromDateKey, fromSlot, toDateKey, toSlot) {
        const schedule = Storage.getSchedule();

        // Get session from source
        const sourceDay = schedule[fromDateKey];
        if (!sourceDay || !sourceDay.sessions[fromSlot]) return;

        const session = sourceDay.sessions[fromSlot];

        // Remove from source
        sourceDay.sessions.splice(fromSlot, 1);

        // Add placeholder to source if needed
        if (sourceDay.sessions.length < 3) {
            while (sourceDay.sessions.length < 3) {
                sourceDay.sessions.push(null);
            }
        }

        // Get or create target day
        if (!schedule[toDateKey]) {
            schedule[toDateKey] = {
                date: toDateKey,
                displayDate: Storage.formatDisplayDate(toDateKey),
                sessions: []
            };
        }

        const targetDay = schedule[toDateKey];

        // Replace or add to target
        if (targetDay.sessions[toSlot]) {
            // Swap - move existing session to source
            const swapped = targetDay.sessions[toSlot];
            if (!sourceDay.sessions[fromSlot]) {
                sourceDay.sessions[fromSlot] = swapped;
            } else {
                sourceDay.sessions.push(swapped);
            }
        }

        targetDay.sessions[toSlot] = session;

        // Clean up nulls
        targetDay.sessions = targetDay.sessions.filter(s => s !== null);

        // Ensure we have exactly 3 slots
        while (targetDay.sessions.length < 3) {
            targetDay.sessions.push(null);
        }
        if (targetDay.sessions.length > 3) {
            targetDay.sessions = targetDay.sessions.slice(0, 3);
        }

        Storage.saveSchedule(schedule);
        Storage.addActivity('session_move', `Moved session from ${fromDateKey} slot ${fromSlot + 1} to ${toDateKey} slot ${toSlot + 1}`);
        // Refresh UI to show moved session
        if (window.UI) {
            UI.renderAll();
        }
    },

    // Open session details modal
    openSessionDetails(dateKey, slotIndex) {
        const schedule = Storage.getSchedule();
        const session = schedule[dateKey]?.sessions[slotIndex];

        if (!session) return;

        const modal = document.getElementById('detail-modal');
        const title = document.getElementById('detail-title');
        const body = document.getElementById('detail-body');

        const chapter = session.chapterId ? Storage.getChapters().find(c => c.id === session.chapterId) : null;
        const task = session.taskId ? Storage.getPersonalTasks().find(t => t.id === session.taskId) : null;

        title.innerHTML = `<i class="fas fa-calendar-check"></i> Session Details`;

        body.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Info</h3>
                <div class="detail-list">
                    <li>
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${session.date || dateKey}</span>
                    </li>
                    <li>
                        <span class="detail-label">Time Slot</span>
                        <span class="detail-value">Slot ${slotIndex + 1} (${['9-12 AM', '2-5 PM', '6-9 PM'][slotIndex]})</span>
                    </li>
                    <li>
                        <span class="detail-label">Duration</span>
                        <span class="detail-value">${session.hours} hour(s)</span>
                    </li>
                    <li>
                        <span class="detail-label">Completed</span>
                        <span class="detail-value">${session.completedHours || 0}/${session.hours}h</span>
                    </li>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-book"></i> ${chapter ? 'Chapter' : 'Task'}</h3>
                <div class="detail-list">
                    ${chapter ? `
                        <li>
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${chapter.name}</span>
                        </li>
                        <li>
                            <span class="detail-label">Weightage</span>
                            <span class="detail-value"><span class="badge badge-${chapter.weightage}">${chapter.weightage}</span></span>
                        </li>
                        <li>
                            <span class="detail-label">Progress</span>
                            <span class="detail-value">${Progress.getChapterProgress(chapter)}%</span>
                        </li>
                    ` : ''}
                    ${task ? `
                        <li>
                            <span class="detail-label">Task</span>
                            <span class="detail-value">${task.title}</span>
                        </li>
                        <li>
                            <span class="detail-label">Priority</span>
                            <span class="detail-value"><span class="badge badge-${task.priority}">${task.priority}</span></span>
                        </li>
                    ` : ''}
                </div>
            </div>

            <div class="detail-actions">
                <button onclick="Schedule.editSession('${dateKey}', ${slotIndex})" class="btn btn-primary">
                    <i class="fas fa-edit"></i> Edit Session
                </button>
                <button onclick="Schedule.clearSession('${dateKey}', ${slotIndex})" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Clear Session
                </button>
            </div>
        `;

        modal.classList.add('active');
    },

    // Edit session completion
    editSession(dateKey, slotIndex) {
        const schedule = Storage.getSchedule();
        const session = schedule[dateKey]?.sessions[slotIndex];

        if (!session) return;

        const newHours = prompt('Enter completed hours:', session.completedHours || 0);
        if (newHours !== null) {
            const hours = parseFloat(newHours);
            if (!isNaN(hours) && hours >= 0 && hours <= session.hours) {
                session.completedHours = hours;
                Storage.saveSchedule(schedule);
                document.getElementById('detail-modal').classList.remove('active');
                UI.renderAll();
                Storage.addActivity('session_edit', `Updated ${dateKey} completion to ${hours}h`);
            } else {
                alert(`Please enter a number between 0 and ${session.hours}`);
            }
        }
    },

    // Clear session
    clearSession(dateKey, slotIndex) {
        if (confirm('Remove this scheduled session?')) {
            const schedule = Storage.getSchedule();
            const day = schedule[dateKey];
            if (day) {
                day.sessions.splice(slotIndex, 1);
                while (day.sessions.length < 3) {
                    day.sessions.push(null);
                }
                Storage.saveSchedule(schedule);
                document.getElementById('detail-modal').classList.remove('active');
                UI.renderAll();
            }
        }
    },

    // Add new study session
    addSessionModal() {
        const modal = document.getElementById('add-session-modal') || this.createAddSessionModal();

        // Populate chapter dropdown
        const chapters = Storage.getChapters();
        const select = document.getElementById('session-chapter-select');
        if (select) {
            select.innerHTML = '<option value="">-- Select Chapter --</option>' +
                chapters.map(c => `<option value="${c.id}">${c.name} (${c.weightage})</option>`).join('');
        }

        modal.classList.add('active');
    },

    // Create add session modal if doesn't exist
    createAddSessionModal() {
        const modal = document.createElement('div');
        modal.id = 'add-session-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Schedule Study Session</h2>
                    <button class="close-btn" onclick="Schedule.closeAddSessionModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="session-form">
                        <div class="form-group">
                            <label for="session-date">Date *</label>
                            <input type="date" id="session-date" required>
                        </div>
                        <div class="form-group">
                            <label for="session-time-slot">Time Slot *</label>
                            <select id="session-time-slot" required>
                                <option value="0">9:00 AM - 12:00 PM</option>
                                <option value="1">2:00 PM - 5:00 PM</option>
                                <option value="2">6:00 PM - 9:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-chapter-select">Chapter/Topic</label>
                            <select id="session-chapter-select">
                                <option value="">-- Select Chapter --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-title">Custom Title (optional)</label>
                            <input type="text" id="session-title" placeholder="e.g., Revision, Practice Problems">
                        </div>
                        <div class="form-group">
                            <label for="session-hours">Planned Hours *</label>
                            <input type="number" id="session-hours" min="0.5" max="3" step="0.5" value="2" required>
                        </div>
                        <button type="submit" class="btn btn-primary full-width">
                            <i class="fas fa-calendar-plus"></i> Schedule Session
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Set default date to today
        document.getElementById('session-date').value = Storage.formatDateKey(new Date());

        // Form submit handler
        document.getElementById('session-form').addEventListener('submit', (e) => {
            e.preventDefault();
            Schedule.saveSessionFromModal();
        });
    },

    // Close add session modal
    closeAddSessionModal() {
        const modal = document.getElementById('add-session-modal');
        if (modal) modal.classList.remove('active');
    },

    // Save session from modal
    saveSessionFromModal() {
        const dateKey = document.getElementById('session-date').value;
        const slotIndex = parseInt(document.getElementById('session-time-slot').value);
        const chapterId = document.getElementById('session-chapter-select').value;
        const title = document.getElementById('session-title').value;
        const hours = parseFloat(document.getElementById('session-hours').value);

        if (!dateKey || !hours) {
            alert('Please fill in all required fields');
            return;
        }

        const schedule = Storage.getSchedule();

        // Ensure date exists in schedule
        if (!schedule[dateKey]) {
            schedule[dateKey] = {
                date: dateKey,
                displayDate: Storage.formatDisplayDate(dateKey),
                sessions: []
            };
        }

        // Get chapter details for title if not provided
        let sessionTitle = title;
        let color = null;
        if (chapterId) {
            const chapter = Storage.getChapters().find(c => c.id === chapterId);
            if (chapter) {
                sessionTitle = chapter.name;
                color = this.getColorForWeightage(chapter.weightage);
            }
        } else if (!title) {
            sessionTitle = 'Study Session';
        }

        // Create session
        const session = {
            id: 'session-' + Date.now(),
            chapterId: chapterId || null,
            title: sessionTitle,
            hours: hours,
            completedHours: 0,
            color: color
        };

        // Add to schedule
        if (!schedule[dateKey].sessions[slotIndex]) {
            schedule[dateKey].sessions[slotIndex] = session;
        } else {
            // Replace existing
            schedule[dateKey].sessions[slotIndex] = session;
        }

        Storage.saveSchedule(schedule);
        this.closeAddSessionModal();
        UI.renderAll();
        Storage.addActivity('session_create', `Scheduled: ${sessionTitle} on ${dateKey}`);
    }
};
