// ===== SHARING MODULE =====
// Handles export, import, and friend comparison features

const Sharing = {
    // Export data as JSON file
    exportData() {
        const data = Storage.exportData();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `cse-prep-backup-${timestamp}.json`;
        Storage.downloadFile(data, filename);
        UI.showToast('Data exported successfully!', 'success');
        Storage.addActivity('export', 'Data exported to file');
    },

    // Import data from file
    importDataFromFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            this.processImport(content);
        };

        reader.onerror = () => {
            UI.showToast('Failed to read file', 'error');
        };

        reader.readAsText(file);
    },

    // Import data from JSON string
    importDataFromJSON(jsonString) {
        return this.processImport(jsonString);
    },

    // Process imported data
    processImport(content) {
        const result = Storage.importData(content);

        if (result.success) {
            UI.showToast('Data imported successfully!', 'success');
            UI.renderAll();

            // Clear any saved friend comparison
            Storage.saveFriendData(null);

            // Update comparison view
            document.getElementById('comparison-status').textContent = 'Your data has been updated. Import a friend\'s data to compare progress.';
            document.getElementById('comparison-view').classList.add('hidden');
        } else {
            UI.showToast('Import failed: ' + result.error, 'error');
        }

        return result;
    },

    // Generate QR code for sharing
    async generateQRCode() {
        const data = Storage.exportData();
        const qrContainer = document.getElementById('qr-output');
        const qrCodeDiv = document.getElementById('qr-code');

        // Simple QR implementation using a library if available
        // For now, we'll create a text-based representation
        // In production, use a library like qrcode.js

        qrCodeDiv.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <i class="fas fa-qrcode" style="font-size: 150px; color: var(--primary); opacity: 0.8;"></i>
                <p style="margin-top: 10px; font-weight: 600;">Scan to View My Progress</p>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    (Use a QR scanner app to see shared data)
                </p>
            </div>
        `;

        qrContainer.classList.remove('hidden');
        UI.showToast('QR Code generated! Share it with friends.', 'success');

        // Store shareable data
        const shareData = {
            code: Storage.generateShareCode(),
            timestamp: Date.now()
        };
        localStorage.setItem('csePrep_lastShare', JSON.stringify(shareData));
    },

    // Import friend's progress from share code
    async importFriendByCode(code) {
        // Note: In a real implementation, this would query a server
        // For now, we'll simulate with a prompt to paste JSON
        UI.showToast('Please use the Upload JSON option for now', 'warning');
        return false;
    },

    // Import friend's progress from file
    importFriendFromFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const friendData = JSON.parse(e.target.result);

                // Store friend data separately
                Storage.saveFriendData(friendData);

                UI.showToast('Friend\'s data loaded! You can now compare progress.', 'success');
                this.renderComparison();
            } catch (error) {
                UI.showToast('Invalid friend data file', 'error');
            }
        };

        reader.readAsText(file);
    },

    // Render comparison view
    renderComparison() {
        const friendData = Storage.getFriendData();
        if (!friendData) return;

        const yourProgress = Progress.calculateOverall();
        const friendProgress = this.calculateFriendProgress(friendData);

        // Update comparison stats
        document.getElementById('your-progress-bar').style.width = yourProgress + '%';
        document.getElementById('your-progress-value').textContent = yourProgress + '%';
        document.getElementById('friend-progress-bar').style.width = friendProgress + '%';
        document.getElementById('friend-progress-value').textContent = friendProgress + '%';

        // Generate detailed comparison
        const details = document.getElementById('comparison-details');
        details.innerHTML = this.generateComparisonHTML(friendData);

        document.getElementById('comparison-status').textContent = '';
        document.getElementById('comparison-view').classList.remove('hidden');
    },

    // Calculate friend's overall progress
    calculateFriendProgress(friendData) {
        if (!friendData.data) return 0;

        const chapters = friendData.data.chapters || [];
        const tasks = friendData.data.personalTasks || [];

        if (chapters.length === 0 && tasks.length === 0) return 0;

        const chapterProgress = this.calculateArrayProgress(chapters, 'completed');
        const taskProgress = this.calculateArrayProgress(tasks, 'completed');

        // Weighted average
        const total = (chapterProgress * 0.6 + taskProgress * 0.4);
        return Math.round(total);
    },

    // Calculate array progress
    calculateArrayProgress(array, completedField) {
        if (array.length === 0) return 0;
        const completed = array.filter(item => item[completedField]).length;
        return Math.round((completed / array.length) * 100);
    },

    // Generate comparison HTML
    generateComparisonHTML(friendData) {
        const yourChapters = Storage.getChapters();
        const friendChapters = friendData.data.chapters || [];

        const yourCompleted = yourChapters.filter(c => c.completed).length;
        const friendCompleted = friendChapters.filter(c => c.completed).length;

        const yourTasks = Storage.getPersonalTasks();
        const friendTasks = friendData.data.personalTasks || [];

        return `
            <div class="comparison-metrics">
                <h4>📊 Detailed Comparison</h4>

                <div class="metric-group">
                    <div class="metric-row">
                        <span>Chapters Completed</span>
                        <div style="display: flex; gap: 1rem;">
                            <span style="color: var(--primary);"><strong>You:</strong> ${yourCompleted}/${yourChapters.length}</span>
                            <span style="color: #667eea;"><strong>Friend:</strong> ${friendCompleted}/${friendChapters.length}</span>
                        </div>
                    </div>
                    <div class="metric-row">
                        <span>Tasks Completed</span>
                        <div style="display: flex; gap: 1rem;">
                            <span style="color: var(--primary);"><strong>You:</strong> ${yourTasks.filter(t => t.completed).length}/${yourTasks.length}</span>
                            <span style="color: #667eea;"><strong>Friend:</strong> ${friendTasks.filter(t => t.completed).length}/${friendTasks.length}</span>
                        </div>
                    </div>
                </div>

                <div class="metric-chapters">
                    <h5>📚 Chapter-by-Chapter</h5>
                    <div class="chapter-comparison-list">
                        ${this.generateChapterComparisonHTML(yourChapters, friendChapters)}
                    </div>
                </div>

                ${friendData.exportDate ? `
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem;">
                        Friend's data exported: ${new Date(friendData.exportDate).toLocaleDateString()}
                    </p>
                ` : ''}
            </div>
        `;
    },

    // Generate chapter comparison HTML
    generateChapterComparisonHTML(yourChapters, friendChapters) {
        let html = '';

        // Compare common chapters first
        yourChapters.forEach(yourChapter => {
            const friendChapter = friendChapters.find(f => f.id === yourChapter.id);
            if (friendChapter) {
                const yourProgress = Progress.getChapterProgress(yourChapter);
                const friendProgress = Math.round((friendChapter.completedDays / friendChapter.totalDays) * 100) || (friendChapter.completed ? 100 : 0);

                html += `
                    <div class="comparison-chapter-item">
                        <span class="chapter-name">${yourChapter.name}</span>
                        <div class="progress-compare">
                            <div class="mini-progress">
                                <div class="mini-bar" style="width: ${yourProgress}%; background: var(--primary);"></div>
                                <span>${yourProgress}%</span>
                            </div>
                            <div class="mini-progress">
                                <div class="mini-bar" style="width: ${friendProgress}%; background: #667eea;"></div>
                                <span>${friendProgress}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        return html || '<p class="empty-state">No common chapters found for comparison</p>';
    },

    // Reset comparison
    clearComparison() {
        Storage.saveFriendData(null);
        document.getElementById('comparison-view').classList.add('hidden');
        document.getElementById('comparison-status').textContent = 'Import a friend\'s data to compare progress';
        UI.showToast('Comparison cleared', 'success');
    },

    // Download friend comparison report
    downloadComparisonReport() {
        const friendData = Storage.getFriendData();
        if (!friendData) {
            UI.showToast('No friend data to generate report', 'warning');
            return;
        }

        const yourOverall = Progress.calculateOverall();
        const friendOverall = this.calculateFriendProgress(friendData);

        const report = {
            generatedAt: new Date().toISOString(),
            yourProgress: {
                overall: yourOverall,
                chapters: Progress.calculateChapterProgress(),
                tasks: Progress.calculateTaskProgress(),
                chaptersCompleted: Storage.getChapters().filter(c => c.completed).length,
                totalChapters: Storage.getChapters().length,
                tasksCompleted: Storage.getPersonalTasks().filter(t => t.completed).length,
                totalTasks: Storage.getPersonalTasks().length
            },
            friendProgress: {
                overall: friendOverall,
                chapters: this.calculateFriendProgress(friendData),
                exportDate: friendData.exportDate
            }
        };

        const content = JSON.stringify(report, null, 2);
        const filename = `progress-comparison-${new Date().toISOString().split('T')[0]}.json`;
        Storage.downloadFile(content, filename);
        UI.showToast('Comparison report downloaded', 'success');
    }
};
