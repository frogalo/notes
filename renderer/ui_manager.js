export class UIManager {
    constructor(editorElement) {
        this.fonts = [
            { name: 'Headland One', class: 'font-headland' },
            { name: 'Rajdhani', class: 'font-rajdhani' },
            { name: 'Noto Sans Multani', class: 'font-noto' }
        ];
        this.currentFontIndex = 0;
        this.editor = editorElement;
        this.filePathDisplay = document.getElementById('file-path');
        this.statusIndicator = document.getElementById('status-indicator');
        this.lineCountDisplay = document.getElementById('line-count');
        this.charCountDisplay = document.getElementById('char-count');
        this.wordCountDisplay = document.getElementById('word-count');
        this.infoModal = document.getElementById('info-modal');
        this.infoModalTitle = document.getElementById('info-modal-title');
        this.infoModalBody = document.getElementById('info-modal-body');
        this.currentFontNameDisplay = document.getElementById('current-font-name');
        this.setupModalListeners();
        this.loadFont();
    }
    setupModalListeners() {
        // Modal close button
        document.getElementById('close-modal-btn')?.addEventListener('click', () => this.closeModal());
        // Close modal on overlay click
        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal) {
                this.closeModal();
            }
        });
        // Font switcher
        document.getElementById('next-font-btn')?.addEventListener('click', () => this.switchToNextFont());
    }
    updateFilePathDisplay(path) {
        if (path) {
            const fileName = path.split(/[\\/]/).pop() || path;
            this.filePathDisplay.textContent = fileName;
            this.filePathDisplay.title = path;
        }
        else {
            this.filePathDisplay.textContent = 'Untitled';
            this.filePathDisplay.title = '';
        }
    }
    updateStatusIndicator(isModified) {
        this.statusIndicator.classList.remove('saved', 'modified');
        if (isModified) {
            this.statusIndicator.classList.add('modified');
            this.statusIndicator.title = "Unsaved changes";
        }
        else {
            this.statusIndicator.title = "No changes";
        }
    }
    showSaveSuccess() {
        this.statusIndicator.classList.remove('modified');
        this.statusIndicator.classList.add('saved');
        this.statusIndicator.title = "Saved successfully";
        setTimeout(() => {
            this.statusIndicator.classList.remove('saved');
            this.statusIndicator.title = "No changes";
        }, 1500);
    }
    updateStatistics() {
        // innerText gives us the visual text roughly matching what we want
        const content = this.editor.innerText || '';
        // Line count
        const lines = content ? content.split('\n').length : 1;
        this.lineCountDisplay.textContent = `Lines: ${lines}`;
        // Character count
        const chars = content.length;
        this.charCountDisplay.textContent = `Characters: ${chars}`;
        // Word count
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        this.wordCountDisplay.textContent = `Words: ${words}`;
    }
    showModal() {
        this.infoModal.classList.remove('hidden');
    }
    closeModal() {
        this.infoModal.classList.add('hidden');
    }
    displayHelpContent(data) {
        this.infoModalTitle.textContent = data.title || 'Help';
        let html = '<div class="help-container">';
        if (data.sections) {
            data.sections.forEach((section) => {
                html += `<div class="help-section">`;
                // Section Header with Icon
                html += `<div class="help-section-header">`;
                if (section.icon) {
                    html += `<i data-lucide="${section.icon}" class="help-icon"></i>`;
                }
                html += `<h3 class="help-heading">${section.heading}</h3>`;
                html += `</div>`;
                // Section Description
                if (section.description) {
                    html += `<p class="help-description">${section.description}</p>`;
                }
                // Items Grid
                if (section.items && section.items.length > 0) {
                    html += '<div class="help-items-grid">';
                    section.items.forEach((item) => {
                        html += `<div class="help-item-card">`;
                        html += `<div class="help-item-label">${item.label}</div>`;
                        if (item.syntax) {
                            html += `<div class="help-item-syntax"><code>${item.syntax}</code></div>`;
                        }
                        if (item.text) {
                            html += `<div class="help-item-text">${item.text}</div>`;
                        }
                        html += `</div>`;
                    });
                    html += '</div>';
                }
                html += `</div>`;
            });
        }
        html += '</div>';
        this.infoModalBody.innerHTML = html;
        this.showModal();
        // Re-initialize Lucide icons for the newly added elements
        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons();
        }
    }
    displayChangelogContent(data) {
        this.infoModalTitle.textContent = data.title || 'Changelog';
        // Category icon mapping
        const categoryIcons = {
            'ADDED': 'plus-circle',
            'CHANGED': 'refresh-cw',
            'IMPROVED': 'trending-up',
            'DEPRECATED': 'alert-triangle',
            'REMOVED': 'trash-2',
            'FIXED': 'wrench',
            'SECURITY': 'shield',
            'PERFORMANCE': 'zap',
            'DOCUMENTATION': 'book-open',
            'UPGRADED': 'arrow-up-circle',
            'REVERTED': 'corner-up-left'
        };
        let html = '<div class="changelog-container">';
        if (data.releases) {
            data.releases.forEach((release) => {
                html += `<div class="changelog-release">`;
                // Release Header
                html += '<div class="changelog-header">';
                html += `<div class="changelog-version">v${release.version}</div>`;
                html += `<div class="changelog-date">${release.date}</div>`;
                html += '</div>';
                // Changes by category
                if (release.changes) {
                    html += '<div class="changelog-changes">';
                    release.changes.forEach((change) => {
                        const category = change.category.toUpperCase();
                        const icon = categoryIcons[category] || 'circle';
                        html += `<div class="changelog-category-group">`;
                        html += `<div class="changelog-category-header">`;
                        html += `<i data-lucide="${icon}" class="changelog-category-icon"></i>`;
                        html += `<span class="changelog-category-label">${change.category}</span>`;
                        html += `</div>`;
                        if (change.items && change.items.length > 0) {
                            html += '<ul class="changelog-items">';
                            change.items.forEach((item) => {
                                html += `<li class="changelog-item">${item}</li>`;
                            });
                            html += '</ul>';
                        }
                        html += `</div>`;
                    });
                    html += '</div>';
                }
                html += `</div>`;
            });
        }
        html += '</div>';
        this.infoModalBody.innerHTML = html;
        this.showModal();
        // Re-initialize Lucide icons for the newly added elements
        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons();
        }
    }
    loadFont() {
        const savedFontIndex = localStorage.getItem('currentFontIndex');
        if (savedFontIndex !== null) {
            this.currentFontIndex = parseInt(savedFontIndex, 10);
            if (this.currentFontIndex >= this.fonts.length) {
                this.currentFontIndex = 0;
            }
        }
        this.applyFont();
    }
    switchToNextFont() {
        this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
        this.applyFont();
        localStorage.setItem('currentFontIndex', this.currentFontIndex.toString());
    }
    applyFont() {
        const font = this.fonts[this.currentFontIndex];
        // Remove all font classes
        this.fonts.forEach(f => {
            this.editor.classList.remove(f.class);
            document.body.classList.remove(f.class);
        });
        // Add new font class to editor and body
        this.editor.classList.add(font.class);
        document.body.classList.add(font.class);
        this.currentFontNameDisplay.textContent = font.name;
    }
}
