import { MarkdownUtils } from './markdown_utils.js';

export class UIManager {
    private filePathDisplay: HTMLElement;
    private statusIndicator: HTMLElement;
    private lineCountDisplay: HTMLElement;
    private charCountDisplay: HTMLElement;
    private wordCountDisplay: HTMLElement;
    private infoModal: HTMLElement;
    private infoModalTitle: HTMLElement;
    private infoModalBody: HTMLElement;
    private currentFontNameDisplay: HTMLElement;
    private editor: HTMLElement;

    private fonts = [
        { name: 'Headland One', class: 'font-headland' },
        { name: 'Rajdhani', class: 'font-rajdhani' },
        { name: 'Noto Sans Multani', class: 'font-noto' }
    ];
    private currentFontIndex: number = 0;

    constructor(editorElement: HTMLElement) {
        this.editor = editorElement;
        this.filePathDisplay = document.getElementById('file-path') as HTMLElement;
        this.statusIndicator = document.getElementById('status-indicator') as HTMLElement;
        this.lineCountDisplay = document.getElementById('line-count') as HTMLElement;
        this.charCountDisplay = document.getElementById('char-count') as HTMLElement;
        this.wordCountDisplay = document.getElementById('word-count') as HTMLElement;
        this.infoModal = document.getElementById('info-modal') as HTMLElement;
        this.infoModalTitle = document.getElementById('info-modal-title') as HTMLElement;
        this.infoModalBody = document.getElementById('info-modal-body') as HTMLElement;
        this.currentFontNameDisplay = document.getElementById('current-font-name') as HTMLElement;

        this.setupModalListeners();
        this.loadFont();
    }

    private setupModalListeners() {
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

    updateFilePathDisplay(path: string | null) {
        if (path) {
            const fileName = path.split(/[\\/]/).pop() || path;
            this.filePathDisplay.textContent = fileName;
            this.filePathDisplay.title = path;
        } else {
            this.filePathDisplay.textContent = 'Untitled';
            this.filePathDisplay.title = '';
        }
    }

    updateStatusIndicator(isModified: boolean) {
        this.statusIndicator.classList.remove('saved', 'modified');
        if (isModified) {
            this.statusIndicator.classList.add('modified');
            this.statusIndicator.title = "Unsaved changes";
        } else {
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

    displayHelpContent(data: any) {
        this.infoModalTitle.textContent = data.title || 'Help';

        let html = '<div class="help-container">';

        if (data.sections) {
            data.sections.forEach((section: any) => {
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
                    section.items.forEach((item: any) => {
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
        if (typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }

    displayChangelogContent(data: any) {
        this.infoModalTitle.textContent = data.title || 'Changelog';

        // Category icon mapping
        const categoryIcons: { [key: string]: string } = {
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
            data.releases.forEach((release: any) => {
                html += `<div class="changelog-release">`;

                // Release Header
                html += '<div class="changelog-header">';
                html += `<div class="changelog-version">v${release.version}</div>`;
                html += `<div class="changelog-date">${release.date}</div>`;
                html += '</div>';

                // Changes by category
                if (release.changes) {
                    html += '<div class="changelog-changes">';
                    release.changes.forEach((change: any) => {
                        const category = change.category.toUpperCase();
                        const icon = categoryIcons[category] || 'circle';

                        html += `<div class="changelog-category-group">`;
                        html += `<div class="changelog-category-header">`;
                        html += `<i data-lucide="${icon}" class="changelog-category-icon"></i>`;
                        html += `<span class="changelog-category-label">${change.category}</span>`;
                        html += `</div>`;

                        if (change.items && change.items.length > 0) {
                            html += '<ul class="changelog-items">';
                            change.items.forEach((item: string) => {
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
        if (typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }

    private loadFont() {
        const savedFontIndex = localStorage.getItem('currentFontIndex');
        if (savedFontIndex !== null) {
            this.currentFontIndex = parseInt(savedFontIndex, 10);
            if (this.currentFontIndex >= this.fonts.length) {
                this.currentFontIndex = 0;
            }
        }
        this.applyFont();
    }

    private switchToNextFont() {
        this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
        this.applyFont();
        localStorage.setItem('currentFontIndex', this.currentFontIndex.toString());
    }

    private applyFont() {
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
