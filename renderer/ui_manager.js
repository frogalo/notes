export class UIManager {
    constructor(editorElement) {
        this.fonts = [
            { name: 'Headland One', class: 'font-headland' },
            { name: 'Rajdhani', class: 'font-rajdhani' },
            { name: 'Noto Sans Multani', class: 'font-noto' },
            { name: 'Lexend Mega', class: 'font-lexend' },
            { name: 'Caveat Brush', class: 'font-caveat' },
            { name: 'Noto Sans Bengali', class: 'font-bengali' }
        ];
        this.currentFontIndex = 0;
        this.currentFontSize = 1.333; // Default size in rem
        this.savedState = {
            theme: 'default-dark',
            fontIndex: 0,
            fontSize: 1.333
        };
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
        this.stylesModal = document.getElementById('styles-modal');
        this.setupModalListeners();
        this.loadAppearance();
    }
    setupModalListeners() {
        // Info Modal close button
        document.getElementById('close-modal-btn')?.addEventListener('click', () => this.closeModal());
        // Styles Modal close button (Cancel behavior)
        document.getElementById('close-styles-modal-btn')?.addEventListener('click', () => {
            this.revertAppearance();
            this.stylesModal.classList.add('hidden');
        });
        // Styles Button in Toolbar (Open behavior)
        document.getElementById('styles-btn')?.addEventListener('click', () => {
            this.savedState = {
                theme: localStorage.getItem('currentTheme') || 'default-dark',
                fontIndex: parseInt(localStorage.getItem('currentFontIndex') || '0', 10),
                fontSize: parseFloat(localStorage.getItem('currentFontSize') || '1.333')
            };
            // Sync UI with saved state just in case
            this.updateStyleUI();
            this.stylesModal.classList.remove('hidden');
        });
        // Save Button (Commit behavior)
        document.getElementById('save-styles-btn')?.addEventListener('click', () => {
            this.saveAppearance();
            this.stylesModal.classList.add('hidden');
        });
        // Close modals on overlay click (Cancel behavior)
        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal)
                this.closeModal();
        });
        this.stylesModal.addEventListener('click', (e) => {
            if (e.target === this.stylesModal) {
                this.revertAppearance();
                this.stylesModal.classList.add('hidden');
            }
        });
        // Initialize Custom Selects
        this.initCustomSelects();
        // Font Size Controls - Live Preview
        document.getElementById('increase-font-btn')?.addEventListener('click', () => this.changeFontSize(0.1));
        document.getElementById('decrease-font-btn')?.addEventListener('click', () => this.changeFontSize(-0.1));
    }
    initCustomSelects() {
        // --- Theme Select ---
        const themeSelect = document.getElementById('theme-custom-select');
        if (themeSelect) {
            const trigger = themeSelect.querySelector('.select-trigger');
            const dropdown = themeSelect.querySelector('.select-dropdown');
            // Toggle dropdown
            trigger?.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.custom-select.open').forEach(el => {
                    if (el !== themeSelect)
                        el.classList.remove('open');
                });
                themeSelect.classList.toggle('open');
            });
            // Build Options
            const themes = [
                { label: 'Dark Themes', items: [
                        { name: 'Default Dark', value: 'default-dark', colors: ['#0d1314', '#e5edef', '#acc7cc'] },
                        { name: 'Dark Chocolate', value: 'dark-1', colors: ['#0a080a', '#f2eef3', '#c2b3c6'] },
                        { name: 'Deep Blue & Violet', value: 'dark-2', colors: ['#05161e', '#e5f3fb', '#80cfeb'] },
                        { name: 'Neon Pink', value: 'dark-3', colors: ['#0e0007', '#ffd0ee', '#fe6cc5'] }
                    ] },
                { label: 'Light Themes', items: [
                        { name: 'Soft Gold & Green', value: 'light-1', colors: ['#f8f7f2', '#15150b', '#ada564'] },
                        { name: 'Pink & Rose', value: 'light-2', colors: ['#faf6f8', '#0c080a', '#bd488c'] },
                        { name: 'Fresh Green', value: 'light-3', colors: ['#f9fbf9', '#0b0f0b', '#4fb25b'] },
                        { name: 'Purple & Pink', value: 'light-4', colors: ['#fbf9ff', '#0e011c', '#781bf6'] }
                    ] }
            ];
            if (dropdown) {
                dropdown.innerHTML = ''; // Clear
                themes.forEach(group => {
                    const header = document.createElement('div');
                    header.className = 'select-group-header';
                    header.textContent = group.label;
                    dropdown.appendChild(header);
                    group.items.forEach(item => {
                        const opt = document.createElement('div');
                        opt.className = 'select-option';
                        opt.dataset.value = item.value;
                        // Color Dots
                        let dotsHtml = '<div class="theme-preview-dots">';
                        item.colors.forEach(c => {
                            dotsHtml += `<div class="dot" style="background-color: ${c}"></div>`;
                        });
                        dotsHtml += '</div>';
                        opt.innerHTML = `${dotsHtml}<span>${item.name}</span>`;
                        opt.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.setTheme(item.value);
                            themeSelect.classList.remove('open');
                        });
                        dropdown.appendChild(opt);
                    });
                });
            }
        }
        // --- Font Select ---
        const fontSelect = document.getElementById('font-custom-select');
        if (fontSelect) {
            const trigger = fontSelect.querySelector('.select-trigger');
            const dropdown = fontSelect.querySelector('.select-dropdown');
            trigger?.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.custom-select.open').forEach(el => {
                    if (el !== fontSelect)
                        el.classList.remove('open');
                });
                fontSelect.classList.toggle('open');
            });
            if (dropdown) {
                dropdown.innerHTML = '';
                this.fonts.forEach((font, index) => {
                    const opt = document.createElement('div');
                    opt.className = `select-option ${font.class}`; // Apply font class
                    opt.textContent = font.name;
                    opt.style.fontSize = '1.1rem'; // Make it slightly larger to see detail
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.currentFontIndex = index;
                        this.applyFont();
                        fontSelect.classList.remove('open');
                    });
                    dropdown.appendChild(opt);
                });
            }
        }
        // Close all on window click
        window.addEventListener('click', () => {
            document.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
        });
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
    loadAppearance() {
        // Load initial state from local storage
        this.savedState.theme = localStorage.getItem('currentTheme') || 'default-dark';
        const savedFontIndex = localStorage.getItem('currentFontIndex');
        if (savedFontIndex !== null)
            this.savedState.fontIndex = parseInt(savedFontIndex, 10);
        const savedFontSize = localStorage.getItem('currentFontSize');
        if (savedFontSize !== null)
            this.savedState.fontSize = parseFloat(savedFontSize);
        // Apply
        this.currentFontIndex = this.savedState.fontIndex;
        this.currentFontSize = this.savedState.fontSize;
        this.setTheme(this.savedState.theme);
        this.applyFont();
        this.applyFontSize();
        // Update UI controls
        this.updateStyleUI();
    }
    updateStyleUI() {
        // Update Theme Select UI
        const currentTheme = localStorage.getItem('currentTheme') || 'default-dark';
        const themeSelect = document.getElementById('theme-custom-select');
        if (themeSelect) {
            const displayText = themeSelect.querySelector('.selected-text');
            // Find name from value - quick lookup
            const themes = [
                { name: 'Default Dark', value: 'default-dark' },
                { name: 'Dark Chocolate', value: 'dark-1' },
                { name: 'Deep Blue & Violet', value: 'dark-2' },
                { name: 'Neon Pink', value: 'dark-3' },
                { name: 'Soft Gold & Green', value: 'light-1' },
                { name: 'Pink & Rose', value: 'light-2' },
                { name: 'Fresh Green', value: 'light-3' },
                { name: 'Purple & Pink', value: 'light-4' }
            ];
            const foundState = themes.find(t => t.value === currentTheme);
            if (displayText && foundState)
                displayText.textContent = foundState.name;
        }
        // Update Font Select UI
        // We do this in applyFont as well to keep sync
        this.updateFontSizeDisplay();
    }
    saveAppearance() {
        // Commit current state to local storage
        localStorage.setItem('currentTheme', document.body.getAttribute('data-theme') || 'default-dark');
        localStorage.setItem('currentFontIndex', this.currentFontIndex.toString());
        localStorage.setItem('currentFontSize', this.currentFontSize.toString());
        // Update saved state
        this.savedState = {
            theme: localStorage.getItem('currentTheme') || 'default-dark',
            fontIndex: this.currentFontIndex,
            fontSize: this.currentFontSize
        };
    }
    revertAppearance() {
        // Revert to saved state
        this.setTheme(this.savedState.theme);
        this.currentFontIndex = this.savedState.fontIndex;
        this.applyFont();
        this.currentFontSize = this.savedState.fontSize;
        this.applyFontSize();
        this.updateStyleUI();
    }
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // Update Select Trigger Text
        const themeSelect = document.getElementById('theme-custom-select');
        if (themeSelect) {
            const displayText = themeSelect.querySelector('.selected-text');
            // Helper to get name from value
            const allThemes = [
                { name: 'Default Dark', value: 'default-dark' },
                { name: 'Dark Chocolate', value: 'dark-1' },
                { name: 'Deep Blue & Violet', value: 'dark-2' },
                { name: 'Neon Pink', value: 'dark-3' },
                { name: 'Soft Gold & Green', value: 'light-1' },
                { name: 'Pink & Rose', value: 'light-2' },
                { name: 'Fresh Green', value: 'light-3' },
                { name: 'Purple & Pink', value: 'light-4' }
            ];
            const foundState = allThemes.find(t => t.value === theme);
            if (displayText && foundState)
                displayText.textContent = foundState.name;
        }
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
        // Update Live Preview Box font
        const previewBox = document.getElementById('font-preview');
        if (previewBox) {
            // Remove old classes
            this.fonts.forEach(f => previewBox.classList.remove(f.class));
            // Add new class
            previewBox.classList.add(font.class);
        }
        // Update Custom Select Trigger
        const fontTriggerText = document.getElementById('font-trigger-text');
        if (fontTriggerText) {
            fontTriggerText.textContent = font.name;
            // Also apply font class to trigger text?
            this.fonts.forEach(f => fontTriggerText.classList.remove(f.class));
            fontTriggerText.classList.add(font.class);
        }
    }
    changeFontSize(delta) {
        this.currentFontSize = Math.max(0.5, Math.min(4.0, this.currentFontSize + delta));
        this.currentFontSize = Math.round(this.currentFontSize * 10) / 10; // Round to 1 decimal
        this.updateFontSizeDisplay();
        this.applyFontSize();
        // localStorage write moved to saveAppearance
    }
    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-xl', `${this.currentFontSize}rem`);
    }
    updateFontSizeDisplay() {
        const display = document.getElementById('font-size-display');
        if (display) {
            display.textContent = `${this.currentFontSize}rem`;
        }
    }
}
