"use strict";
/**
 * Renderer process script
 * Handles UI interactions and communicates with main process
 */
// Reference type definitions
/// <reference path="../src/types.d.ts" />
/**
 * Text Editor Application - Renderer Class
 */
class TextEditorRenderer {
    constructor() {
        // Track the currently active block for contextual syntax hiding
        this.activeBlock = null;
        this.currentFilePath = null;
        this.isModified = false;
        this.lastSavedContent = '';
        this.fonts = [
            { name: 'Headland One', class: 'font-headland' },
            { name: 'Rajdhani', class: 'font-rajdhani' },
            { name: 'Noto Sans Multani', class: 'font-noto' }
        ];
        this.currentFontIndex = 0;
        this.editor = document.getElementById('rich-editor');
        this.filePathDisplay = document.getElementById('file-path');
        this.statusIndicator = document.getElementById('status-indicator');
        this.lineCountDisplay = document.getElementById('line-count');
        this.charCountDisplay = document.getElementById('char-count');
        this.wordCountDisplay = document.getElementById('word-count');
        this.infoModal = document.getElementById('info-modal');
        this.infoModalTitle = document.getElementById('info-modal-title');
        this.infoModalBody = document.getElementById('info-modal-body');
        this.currentFontNameDisplay = document.getElementById('current-font-name');
        this.contextMenu = document.getElementById('context-menu');
        this.initialize();
    }
    /**
     * Initialize the application
     */
    initialize() {
        this.loadFont();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupContextMenu();
        this.updateStatistics();
    }
    /**
     * Setup event listeners for buttons and editor
     */
    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('new-file-btn')?.addEventListener('click', () => this.handleNewFile());
        document.getElementById('open-file-btn')?.addEventListener('click', () => this.handleOpenFile());
        document.getElementById('save-file-btn')?.addEventListener('click', () => this.handleSaveFile());
        // Save As button removed from UI, but shortcut still works
        document.getElementById('help-btn')?.addEventListener('click', () => this.handleShowHelp());
        document.getElementById('changelog-btn')?.addEventListener('click', () => this.handleShowChangelog());
        // Font switcher button
        document.getElementById('next-font-btn')?.addEventListener('click', () => this.switchToNextFont());
        // Modal close button
        document.getElementById('close-modal-btn')?.addEventListener('click', () => this.closeModal());
        // Close modal on overlay click
        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal) {
                this.closeModal();
            }
        });
        // Editor events
        this.editor.addEventListener('input', () => this.handleEditorInput());
        this.editor.addEventListener('keydown', (e) => this.handleEditorKeydown(e));
        // Contextual syntax hiding
        document.addEventListener('selectionchange', () => this.handleSelectionChange());
    }
    /**
     * Setup custom context menu
     */
    setupContextMenu() {
        const ctxCut = document.getElementById('ctx-cut');
        const ctxCopy = document.getElementById('ctx-copy');
        const ctxPaste = document.getElementById('ctx-paste');
        // Show menu on right-click
        this.editor.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const { clientX, clientY } = e;
            this.contextMenu.style.top = `${clientY}px`;
            this.contextMenu.style.left = `${clientX}px`;
            this.contextMenu.classList.remove('hidden');
        });
        // Hide menu on any click
        document.addEventListener('click', () => {
            this.contextMenu.classList.add('hidden');
        });
        // Actions
        ctxCut?.addEventListener('click', () => {
            document.execCommand('cut');
        });
        ctxCopy?.addEventListener('click', () => {
            document.execCommand('copy');
        });
        ctxPaste?.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    this.restoreSelection();
                    document.execCommand('insertText', false, text);
                }
            }
            catch (err) {
                console.error('Failed to read clipboard:', err);
            }
        });
    }
    restoreSelection() {
        this.editor.focus();
    }
    getMarkdownContent() {
        const lines = [];
        this.editor.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                lines.push(node.textContent || '');
            }
        });
        return lines.join('\n');
    }
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;
            if (modifier) {
                switch (e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.handleNewFile();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.handleOpenFile();
                        break;
                    case 's':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.handleSaveAsFile();
                        }
                        else {
                            this.handleSaveFile();
                        }
                        break;
                }
            }
        });
    }
    /**
     * Handle new file creation
     */
    async handleNewFile() {
        if (this.isModified) {
            const confirmed = confirm('You have unsaved changes. Create a new file anyway?');
            if (!confirmed)
                return;
        }
        this.editor.innerHTML = '';
        this.currentFilePath = null;
        this.lastSavedContent = '';
        this.isModified = false;
        this.updateFilePathDisplay();
        this.updateStatusIndicator();
        this.updateStatistics();
        this.editor.focus();
        await window.electronAPI.newFile();
    }
    /**
     * Handle file opening
     */
    async handleOpenFile() {
        if (this.isModified) {
            const confirmed = confirm('You have unsaved changes. Open a new file anyway?');
            if (!confirmed)
                return;
        }
        try {
            const result = await window.electronAPI.openFile();
            if (result && result.success && result.content !== undefined) {
                // Initialize as rich text
                this.editor.innerHTML = this.formatAllContent(result.content);
                this.currentFilePath = result.filePath || null;
                this.lastSavedContent = result.content; // Save plain text for comparison
                this.isModified = false;
                this.updateFilePathDisplay();
                this.updateStatusIndicator();
                this.updateStatistics();
                this.editor.focus();
            }
        }
        catch (error) {
            console.error('Error opening file:', error);
            alert('Failed to open file');
        }
    }
    /**
     * Convert full text to formatted HTML lines (for initial load)
     */
    /**
     * Convert full text to formatted HTML lines (for initial load)
     */
    formatAllContent(text) {
        if (!text)
            return '<div><br></div>';
        return text.split('\n').map(line => {
            let html = this.escapeHtml(line);
            let className = '';
            // Headers
            const hMatch = html.match(/^(#{1,3})\s+(.*)$/);
            if (hMatch) {
                className = `md-block-h${hMatch[1].length}`;
                html = `<span class="md-syntax">${hMatch[1]} </span>${hMatch[2]}`;
            }
            // Quote (> or > )
            else if (line.startsWith('>')) {
                className = 'md-block-quote';
                // Handle empty quote line ">" vs "> text"
                let content = line.startsWith('> ') ? line.substring(2) : line.substring(1);
                if (line === '>')
                    content = ''; // Empty line case
                html = `<span class="md-syntax">&gt; </span>${this.applyInlineFormatting(this.escapeHtml(content))}`;
            }
            // Horizontal Rule
            else if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
                className = 'md-block-hr';
                html = `<span class="md-syntax">${html}</span>`;
            }
            // Unordered List (- * +)
            else if (/^\s*[-*+]\s+/.test(line)) {
                className = 'md-block-ul';
                const match = line.match(/^(\s*)([-*+])\s+(.*)$/);
                if (match) {
                    const indent = match[1];
                    const marker = match[2];
                    const content = match[3];
                    html = `<span class="md-list-marker md-list-marker-ul">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                }
            }
            // Ordered List (1. 2. etc)
            else if (/^\s*\d+\.\s+/.test(line)) {
                className = 'md-block-ol';
                const match = line.match(/^(\s*)(\d+\.)\s+(.*)$/);
                if (match) {
                    const indent = match[1];
                    const marker = match[2];
                    const content = match[3];
                    html = `<span class="md-list-marker md-list-marker-ol">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                }
            }
            else {
                html = this.applyInlineFormatting(html);
            }
            return `<div class="${className}">${html || '<br>'}</div>`;
        }).join('');
    }
    /**
     * Handle file saving
     */
    async handleSaveFile() {
        // Use textContent to get Markdown (strips hidden spans' tags but keeps text, OR use innerText?)
        // Note: innerText handles newlines better in some cases (divs -> \n).
        // textContent joins text nodes. If we have <div>line1</div><div>line2</div>, textContent might be "line1line2".
        // innerText is usually "line1\nline2".
        const content = this.getMarkdownContent();
        try {
            const result = await window.electronAPI.saveFile(content);
            if (result.success) {
                this.currentFilePath = result.filePath || this.currentFilePath;
                this.lastSavedContent = content;
                this.isModified = false;
                this.updateFilePathDisplay();
                this.showSaveSuccess();
            }
            else {
                console.error('Save failed:', result.error);
                if (result.error !== 'Save cancelled') {
                    alert('Failed to save file');
                }
            }
        }
        catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file');
        }
    }
    /**
     * Handle save as operation
     */
    async handleSaveAsFile() {
        const content = this.getMarkdownContent();
        try {
            const result = await window.electronAPI.saveFileAs(content);
            if (result.success) {
                this.currentFilePath = result.filePath || this.currentFilePath;
                this.lastSavedContent = content;
                this.isModified = false;
                this.updateFilePathDisplay();
                this.showSaveSuccess();
            }
            else {
                console.error('Save As failed:', result.error);
                if (result.error !== 'Save cancelled') {
                    alert('Failed to save file');
                }
            }
        }
        catch (error) {
            console.error('Error in save as:', error);
            alert('Failed to save file');
        }
    }
    /**
     * Update file path display
     */
    updateFilePathDisplay() {
        if (this.currentFilePath) {
            const fileName = this.currentFilePath.split(/[\\/]/).pop() || this.currentFilePath;
            this.filePathDisplay.textContent = fileName;
            this.filePathDisplay.title = this.currentFilePath;
        }
        else {
            this.filePathDisplay.textContent = 'Untitled';
            this.filePathDisplay.title = '';
        }
    }
    /**
     * Update status indicator
     */
    updateStatusIndicator() {
        this.statusIndicator.classList.remove('saved', 'modified');
        if (this.isModified) {
            this.statusIndicator.classList.add('modified');
            this.statusIndicator.title = "Unsaved changes";
        }
        else {
            this.statusIndicator.title = "No changes";
        }
    }
    /**
     * Show save success indicator
     */
    showSaveSuccess() {
        this.statusIndicator.classList.remove('modified');
        this.statusIndicator.classList.add('saved');
        this.statusIndicator.title = "Saved successfully";
        setTimeout(() => {
            this.statusIndicator.classList.remove('saved');
            this.statusIndicator.title = "No changes";
        }, 1500);
    }
    /**
     * Update statistics (lines, characters, words)
     */
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
    /**
     * Show Help modal
     */
    async handleShowHelp() {
        try {
            const helpData = await window.electronAPI.loadHelp();
            if (helpData) {
                this.displayHelpContent(helpData);
                this.showModal();
            }
        }
        catch (error) {
            console.error('Error loading help:', error);
        }
    }
    /**
     * Show Changelog modal
     */
    async handleShowChangelog() {
        try {
            const changelogData = await window.electronAPI.loadChangelog();
            if (changelogData) {
                this.displayChangelogContent(changelogData);
                this.showModal();
            }
        }
        catch (error) {
            console.error('Error loading changelog:', error);
        }
    }
    /**
     * Display Help content in modal
     */
    /**
     * Parse simple markdown for modals
     */
    displayHelpContent(data) {
        this.infoModalTitle.textContent = data.title || 'Help';
        let html = '';
        if (data.sections) {
            data.sections.forEach((section) => {
                html += `<div class="modal-section">`;
                html += `<h3>${section.heading}</h3>`;
                if (section.content) {
                    html += `<p>${this.escapeHtml(section.content)}</p>`;
                }
                if (section.items) {
                    html += '<ul class="feature-list">';
                    section.items.forEach((item) => {
                        html += `<li>${this.escapeHtml(item)}</li>`;
                    });
                    html += '</ul>';
                }
                html += `</div>`;
            });
        }
        this.infoModalBody.innerHTML = html;
    }
    displayChangelogContent(data) {
        this.infoModalTitle.textContent = data.title || 'Changelog';
        let html = '';
        if (data.releases) {
            data.releases.forEach((release) => {
                // Determine milestone status
                const isMajor = release.version.endsWith('.0') || release.version.endsWith('.0.0');
                const milestoneClass = isMajor ? 'milestone-release' : '';
                html += `<div class="version-section ${milestoneClass}">`;
                html += '<div class="version-header">';
                html += `<div class="version-title">
                            <span class="version-number">v${release.version}</span>
                            ${isMajor ? '<span class="milestone-badge">MILESTONE</span>' : ''}
                         </div>`;
                html += `<span class="version-date">${release.date}</span>`;
                html += '</div>';
                if (release.changes) {
                    html += `<div class="changes-grid">`;
                    release.changes.forEach((change) => {
                        // Map categories to CSS classes
                        let badgeClass = 'badge-default';
                        const catLower = change.category.toLowerCase();
                        if (catLower.includes('add'))
                            badgeClass = 'badge-added';
                        else if (catLower.includes('fix'))
                            badgeClass = 'badge-fixed';
                        else if (catLower.includes('change') || catLower.includes('modern'))
                            badgeClass = 'badge-changed';
                        html += `<div class="change-group">`;
                        html += `<div class="change-category"><span class="badge ${badgeClass}">${change.category}</span></div>`;
                        if (change.items) {
                            html += '<ul>';
                            change.items.forEach((item) => {
                                html += `<li>${this.escapeHtml(item)}</li>`;
                            });
                            html += '</ul>';
                        }
                        html += `</div>`;
                    });
                    html += `</div>`;
                }
                html += '</div>';
            });
        }
        this.infoModalBody.innerHTML = html;
    }
    /**
     * Show modal
     */
    showModal() {
        this.infoModal.classList.remove('hidden');
    }
    /**
     * Close modal
     */
    closeModal() {
        this.infoModal.classList.add('hidden');
    }
    /**
     * Load saved font from localStorage
     */
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
    /**
     * Switch to next font in the list
     */
    switchToNextFont() {
        this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
        this.applyFont();
        localStorage.setItem('currentFontIndex', this.currentFontIndex.toString());
    }
    /**
     * Handle active block detection for contextual syntax hiding
     */
    handleSelectionChange() {
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode)
            return;
        let node = sel.anchorNode;
        // Find block element
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }
        // Walk up until we find a child of editor or editor itself
        while (node && node !== this.editor && node.parentNode !== this.editor) {
            node = node.parentNode;
        }
        const block = node;
        // Check if valid block inside editor
        if (block && block !== this.editor && this.editor.contains(block)) {
            if (this.activeBlock !== block) {
                this.activeBlock?.classList.remove('active-block');
                this.activeBlock = block;
                this.activeBlock.classList.add('active-block');
            }
        }
        else {
            this.activeBlock?.classList.remove('active-block');
            this.activeBlock = null;
        }
    }
    /**
     * Handle editor input changes
     */
    handleEditorInput() {
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
            let block = sel.anchorNode;
            if (block.nodeType === Node.TEXT_NODE)
                block = block.parentElement;
            // Ensure we have the block reference (child of editor)
            while (block && block.parentElement !== this.editor && block !== this.editor) {
                block = block.parentElement;
            }
            if (block && block !== this.editor) {
                this.processBlock(block);
                // Ensure it's active since we are typing in it
                if (this.activeBlock !== block) {
                    this.activeBlock?.classList.remove('active-block');
                    this.activeBlock = block;
                    this.activeBlock.classList.add('active-block');
                }
            }
        }
        const currentContent = this.editor.innerText || '';
        this.isModified = currentContent !== this.lastSavedContent;
        this.updateStatusIndicator();
        this.updateStatistics();
    }
    /**
     * Process a single block for markdown syntax and structure
     */
    processBlock(block) {
        const text = block.textContent || '';
        const wasActive = block.classList.contains('active-block');
        // Clear previous structural classes
        block.classList.remove('md-block-h1', 'md-block-h2', 'md-block-h3', 'md-block-quote', 'md-block-ul', 'md-block-ol', 'md-block-hr');
        let html = this.escapeHtml(text);
        // 1. Headers (Block Level)
        const headerMatch = text.match(/^(#{1,3})\s+(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            block.classList.add(`md-block-h${level}`);
            // Wrap syntax and apply inline to content
            const contentHtml = this.applyInlineFormatting(this.escapeHtml(headerMatch[2]));
            html = `<span class="md-syntax">${headerMatch[1]} </span>${contentHtml}`;
        }
        // 2. Blockquote (Handle > text and > empty)
        else if (text.startsWith('>')) {
            block.classList.add('md-block-quote');
            // Check if there is space
            const content = text.startsWith('> ') ? text.substring(2) : text.substring(1);
            html = `<span class="md-syntax">&gt; </span>${this.applyInlineFormatting(this.escapeHtml(content))}`;
            this.updateBlockContent(block, html, wasActive);
            return;
        }
        // Horizontal Rule
        else if (/^(\*{3,}|-{3,}|_{3,})$/.test(text)) {
            block.classList.add('md-block-hr');
            html = `<span class="md-syntax">${html}</span>`;
            this.updateBlockContent(block, html, wasActive);
            return;
        }
        // 3. Unordered List
        else if (/^\s*[-*+]\s+/.test(text)) {
            block.classList.add('md-block-ul');
            const match = text.match(/^(\s*)([-*+])\s+(.*)$/);
            if (match) {
                const indent = match[1];
                const marker = match[2];
                const content = match[3];
                html = `<span class="md-list-marker md-list-marker-ul">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                this.updateBlockContent(block, html, wasActive);
                return;
            }
        }
        // 4. Ordered List
        else if (/^\s*\d+\.\s+/.test(text)) {
            block.classList.add('md-block-ol');
            const match = text.match(/^(\s*)(\d+\.)\s+(.*)$/);
            if (match) {
                const indent = match[1];
                const marker = match[2];
                const content = match[3];
                html = `<span class="md-list-marker md-list-marker-ol">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                this.updateBlockContent(block, html, wasActive);
                return;
            }
        }
        // 3. Inline Formatting (if not a header already matched)
        if (!headerMatch) {
            html = this.applyInlineFormatting(html);
        }
        this.updateBlockContent(block, html, wasActive);
    }
    updateBlockContent(block, newHTML, wasActive) {
        if (block.innerHTML !== newHTML) {
            this.saveAndRestoreSelection(block, () => {
                block.innerHTML = newHTML;
            });
        }
        if (wasActive && !block.classList.contains('active-block')) {
            block.classList.add('active-block');
        }
    }
    /**
     * Apply inline formatting (Bold/Italic/Code) with strict ordering
     */
    applyInlineFormatting(text) {
        let html = text;
        const replacements = [];
        const pushReplacement = (str) => {
            const token = `__MD_TOKEN_${replacements.length}__`;
            replacements.push(str);
            return token;
        };
        // 1. Code: `text` (Highest Priority)
        html = html.replace(/(`)([^`]+)(`)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-code">${content}</span><span class="md-syntax">${suffix}</span>`);
        });
        // 2. Autolinks: <http://...> or <mail@...>
        // Note: input has &lt; and &gt;
        html = html.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, (match, url) => {
            return pushReplacement(`<span class="md-syntax">&lt;</span><a href="${url}" class="md-link">${url}</a><span class="md-syntax">&gt;</span>`);
        });
        html = html.replace(/&lt;([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)&gt;/g, (match, email) => {
            return pushReplacement(`<span class="md-syntax">&lt;</span><a href="mailto:${email}" class="md-link">${email}</a><span class="md-syntax">&gt;</span>`);
        });
        // 3. Links: [text](url "title") or [text](url)
        // Title Link
        html = html.replace(/\[([^\]]+)\]\(([^ )]+)\s+"([^"]+)"\)/g, (match, label, url, title) => {
            // Recursive format of label
            const formattedLabel = this.applyInlineFormatting(label);
            return pushReplacement(`<span class="md-syntax">[</span>` +
                `<a href="${url}" title="${title}" class="md-link">${formattedLabel}</a>` +
                `<span class="md-syntax">](${url} "${title}")</span>`);
        });
        // Standard Link
        html = html.replace(/\[([^\]]+)\]\(([^ )]+)\)/g, (match, label, url) => {
            const formattedLabel = this.applyInlineFormatting(label);
            return pushReplacement(`<span class="md-syntax">[</span>` +
                `<a href="${url}" class="md-link">${formattedLabel}</a>` +
                `<span class="md-syntax">](${url})</span>`);
        });
        // 4. Bold+Italic: ***text***
        html = html.replace(/(\*\*\*)(.+?)(\*\*\*)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-bold md-italic">${content}</span><span class="md-syntax">${suffix}</span>`);
        });
        // 5. Bold: **text**
        html = html.replace(/(\*\*)(.+?)(\*\*)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-bold">${content}</span><span class="md-syntax">${suffix}</span>`);
        });
        // 6. Italic: *text*
        html = html.replace(/(\*)([^*]+)(\*)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-italic">${content}</span><span class="md-syntax">${suffix}</span>`);
        });
        // 7. Restore placeholders
        replacements.forEach((r, i) => {
            html = html.split(`__MD_TOKEN_${i}__`).join(r);
        });
        return html;
    }
    /**
     * Helper: Escape HTML
     */
    escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    /**
     * Save cursor position, execute action, restore cursor
     */
    saveAndRestoreSelection(block, action) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            action();
            return;
        }
        const savedRange = sel.getRangeAt(0);
        // We need robust offset tracking relative to text content, not nodes (since nodes change)
        // Calculate offset in plain text
        const preRange = document.createRange();
        preRange.selectNodeContents(block);
        preRange.setEnd(savedRange.endContainer, savedRange.endOffset);
        const caretOffset = preRange.toString().length;
        action();
        // Restore
        const newRange = document.createRange();
        const textNodeData = this.findTextNodeAt(block, caretOffset);
        if (textNodeData) {
            newRange.setStart(textNodeData.node, textNodeData.offset);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }
    /**
     * Helper to find text node at character offset
     */
    findTextNodeAt(element, offset) {
        // TreeWalker to traverse text nodes
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
        let currentOffset = 0;
        let node;
        while (node = walker.nextNode()) {
            const len = node.textContent?.length || 0;
            if (currentOffset + len >= offset) {
                return { node: node, offset: offset - currentOffset };
            }
            currentOffset += len;
        }
        // Fallback: End of last text node or element content
        return null;
    }
    /**
     * Handle editor keydown events
     */
    handleEditorKeydown(e) {
        // Intercept Enter to reset formatting for new block
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Insert a clean div
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                range.deleteContents(); // Delete selection if any
                // If cursor is in middle of text, we must split the block
                // For MVP, simplistic: Insert newline at cursor
                // We use document.execCommand('insertParagraph') which is standard for contenteditable?
                // Or manual:
                // Let's use execCommand as it handles splitting correctly usually
                // BUT execCommand usually duplicates Enter behavior (duplicating styles).
                // Manual Split:
                // 1. Get current block
                let currentBlock = range.endContainer;
                while (currentBlock && currentBlock.parentNode !== this.editor)
                    currentBlock = currentBlock.parentNode;
                // If we can't find block, fallback to default
                if (!currentBlock || currentBlock === this.editor) {
                    // Empty editor?
                    const newDiv = document.createElement('div');
                    newDiv.appendChild(document.createElement('br'));
                    this.editor.appendChild(newDiv);
                    // Move cursor
                    const newRange = document.createRange();
                    newRange.setStart(newDiv, 0);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    return;
                }
                // We are inside a block.
                // If at end: Append new clean DIV.
                // If in middle: Move remaining content to new clean DIV.
                // SIMPLIFIED MVP "Reset Formatting":
                // Use default behavior, THEN strip class from new block.
                // But default behavior occurs *after* handler if we don't preventDefault.
                // If we use setTimeout(..., 0) we can clean up after.
                // Better: explicit insertion.
                // We'll trust insertParagraph but clean the result?
                // Actually `insertParagraph` creates a new `<div>` (usually).
                // Let's force it.
                document.execCommand('insertParagraph');
                // Now find the new current block (where cursor is)
                const newSel = window.getSelection();
                if (newSel && newSel.anchorNode) {
                    let newBlock = newSel.anchorNode;
                    while (newBlock && newBlock.parentElement !== this.editor)
                        newBlock = newBlock.parentElement;
                    if (newBlock && newBlock.nodeType === Node.ELEMENT_NODE) {
                        // Strip structural classes from the new block
                        newBlock.classList.remove('md-block-h1', 'md-block-h2', 'md-block-h3', 'md-block-quote', 'md-block-ul', 'md-block-ol');
                        // Also selectionChange should trigger
                        this.handleSelectionChange();
                    }
                }
                // We handled it via execCommand (which is deprecated but ubiquitous for contenteditable).
                // Preventing default behavior of the *event*? No, we called execCommand so we set the state.
                // We must prevent browser default action if we called execCommand manually? 
                // Actually execCommand IS the action.
                return; // Allow event? No, e.preventDefault() was implicit above? 
                // Wait, I said e.preventDefault() at top. 
                // So I must call execCommand OR do DOM mainpulation.
                // execCommand('insertParagraph') works well.
            }
        }
        // Shortcuts for Save (Ctrl+S) and Save As (Ctrl+Shift+S) etc.
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.handleSaveAsFile();
                }
                else {
                    this.handleSaveFile();
                }
            }
            else if (e.key === 'o') {
                e.preventDefault();
                this.handleOpenFile();
            }
            else if (e.key === 'n') {
                e.preventDefault();
                this.handleNewFile();
            }
        }
    }
    /**
     * Apply current font to the body
     */
    applyFont() {
        const body = document.body;
        // Remove all font classes
        this.fonts.forEach(font => {
            body.classList.remove(font.class);
        });
        // Add current font class
        const currentFont = this.fonts[this.currentFontIndex];
        body.classList.add(currentFont.class);
        // Update display
        this.currentFontNameDisplay.textContent = currentFont.name;
    }
}
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextEditorRenderer();
});
