/**
 * Renderer process script
 * Handles UI interactions and communicates with main process
 */
import { MarkdownUtils } from './markdown_utils.js';
import { UIManager } from './ui_manager.js';
import { ContextMenu } from './context_menu.js';
/// <reference path="./renderer_types.d.ts" />
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
        this.editor = document.getElementById('rich-editor');
        this.ui = new UIManager(this.editor);
        this.contextMenu = new ContextMenu(this.editor);
        this.initialize();
    }
    /**
     * Initialize the application
     */
    initialize() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.ui.updateStatistics();
        // Initialize with empty first line (will be treated as title)
        if (this.editor.children.length === 0) {
            const firstDiv = document.createElement('div');
            firstDiv.innerHTML = '<br>';
            this.editor.appendChild(firstDiv);
        }
    }
    /**
     * Setup event listeners for buttons and editor
     */
    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('new-file-btn')?.addEventListener('click', () => this.handleNewFile());
        document.getElementById('open-file-btn')?.addEventListener('click', () => this.handleOpenFile());
        document.getElementById('save-file-btn')?.addEventListener('click', () => this.handleSaveFile());
        document.getElementById('help-btn')?.addEventListener('click', () => this.handleShowHelp());
        document.getElementById('changelog-btn')?.addEventListener('click', () => this.handleShowChangelog());
        // Editor events
        this.editor.addEventListener('input', () => this.handleEditorInput());
        this.editor.addEventListener('keydown', (e) => this.handleEditorKeydown(e));
        // Contextual syntax hiding
        document.addEventListener('selectionchange', () => this.handleSelectionChange());
    }
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
    getMarkdownContent() {
        const lines = [];
        this.editor.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node;
                if (el.classList.contains('nota-line')) {
                    // Reconstruct nota line: "Main Text | Annotation"
                    const mainSpan = el.querySelector('[data-nota-main="true"]');
                    const annotationSpan = el.querySelector('[data-nota-annotation="true"]');
                    const mainText = mainSpan ? mainSpan.textContent : '';
                    const annotationText = annotationSpan ? annotationSpan.textContent : '';
                    // We save it with the pipe separator so it can be parsed back
                    lines.push(`${mainText} | ${annotationText}`);
                }
                else {
                    lines.push(node.textContent || '');
                }
            }
            else if (node.nodeType === Node.TEXT_NODE) {
                lines.push(node.textContent || '');
            }
        });
        return lines.join('\n');
    }
    // --- File Operations ---
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
        this.ui.updateFilePathDisplay(this.currentFilePath);
        this.ui.updateStatusIndicator(this.isModified);
        this.ui.updateStatistics();
        this.editor.focus();
        await window.electronAPI.newFile();
    }
    async handleOpenFile() {
        if (this.isModified) {
            const confirmed = confirm('You have unsaved changes. Open a new file anyway?');
            if (!confirmed)
                return;
        }
        try {
            const result = await window.electronAPI.openFile();
            if (result && result.success && result.content !== undefined) {
                this.editor.innerHTML = MarkdownUtils.formatAllContent(result.content);
                this.currentFilePath = result.filePath || null;
                this.lastSavedContent = result.content;
                this.isModified = false;
                this.ui.updateFilePathDisplay(this.currentFilePath);
                this.ui.updateStatusIndicator(this.isModified);
                this.ui.updateStatistics();
                this.editor.focus();
            }
        }
        catch (error) {
            console.error('Error opening file:', error);
            alert('Failed to open file');
        }
    }
    async handleSaveFile() {
        const content = this.getMarkdownContent();
        let suggestedName;
        // If no file path is set, try to infer name from first line (Title)
        if (!this.currentFilePath) {
            const firstLine = content.split('\n')[0] || '';
            const titleMatch = firstLine.trim();
            if (titleMatch) {
                // Sanitize filename
                const safeTitle = titleMatch.replace(/[^a-z0-9\u00a0-\uffff\-_\s]/gi, '').trim().substring(0, 50);
                if (safeTitle) {
                    suggestedName = `${safeTitle}.md`;
                }
            }
        }
        try {
            const result = await window.electronAPI.saveFile(content, suggestedName);
            if (result.success) {
                this.currentFilePath = result.filePath || this.currentFilePath;
                this.lastSavedContent = content;
                this.isModified = false;
                this.ui.updateFilePathDisplay(this.currentFilePath);
                this.ui.showSaveSuccess();
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
    async handleSaveAsFile() {
        const content = this.getMarkdownContent();
        try {
            const result = await window.electronAPI.saveFileAs(content);
            if (result.success) {
                this.currentFilePath = result.filePath || this.currentFilePath;
                this.lastSavedContent = content;
                this.isModified = false;
                this.ui.updateFilePathDisplay(this.currentFilePath);
                this.ui.showSaveSuccess();
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
    // --- Help / Changelog ---
    async handleShowHelp() {
        try {
            const helpData = await window.electronAPI.loadHelp();
            if (helpData) {
                this.ui.displayHelpContent(helpData);
            }
        }
        catch (error) {
            console.error('Error loading help:', error);
        }
    }
    async handleShowChangelog() {
        try {
            const changelogData = await window.electronAPI.loadChangelog();
            if (changelogData) {
                this.ui.displayChangelogContent(changelogData);
            }
        }
        catch (error) {
            console.error('Error loading changelog:', error);
        }
    }
    // --- Editor Interaction & Logic ---
    handleSelectionChange() {
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode)
            return;
        let node = sel.anchorNode;
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }
        while (node && node !== this.editor && node.parentNode !== this.editor) {
            node = node.parentNode;
        }
        const block = node;
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
    handleEditorInput() {
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
            let block = sel.anchorNode;
            if (block.nodeType === Node.TEXT_NODE)
                block = block.parentElement;
            while (block && block.parentElement !== this.editor && block !== this.editor) {
                block = block.parentElement;
            }
            if (block && block !== this.editor) {
                const blockElement = block;
                // Check if we're typing inside an annotation span
                let node = sel.anchorNode;
                let isInAnnotation = false;
                while (node && node !== blockElement) {
                    if (node.dataset?.notaAnnotation === 'true') {
                        isInAnnotation = true;
                        break;
                    }
                    node = node.parentElement;
                }
                // If typing inside annotation, don't reprocess the block
                if (isInAnnotation) {
                    // Just update modified state and stats
                    const currentContent = this.editor.innerText || '';
                    this.isModified = currentContent !== this.lastSavedContent;
                    this.ui.updateStatusIndicator(this.isModified);
                    this.ui.updateStatistics();
                    return;
                }
                const text = blockElement.textContent || '';
                // Check if we just typed the pipe character to enter annotation mode
                if (text.includes('|') && !blockElement.classList.contains('nota-line')) {
                    // Process the block to create the nota structure
                    this.processBlock(blockElement);
                    // Move cursor to the annotation span
                    requestAnimationFrame(() => {
                        const annotationSpan = blockElement.querySelector('[data-nota-annotation="true"]');
                        if (annotationSpan) {
                            const range = document.createRange();
                            const selection = window.getSelection();
                            // Place cursor inside annotation span at the end
                            if (annotationSpan.firstChild && annotationSpan.firstChild.nodeType === Node.TEXT_NODE) {
                                const textNode = annotationSpan.firstChild;
                                range.setStart(textNode, textNode.textContent?.length || 0);
                            }
                            else if (annotationSpan.firstChild) {
                                range.setStart(annotationSpan.firstChild, 0);
                            }
                            else {
                                // If empty, create a text node
                                const textNode = document.createTextNode('');
                                annotationSpan.appendChild(textNode);
                                range.setStart(textNode, 0);
                            }
                            range.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                        }
                    });
                }
                else {
                    this.processBlock(blockElement);
                }
                if (this.activeBlock !== block) {
                    this.activeBlock?.classList.remove('active-block');
                    this.activeBlock = blockElement;
                    this.activeBlock.classList.add('active-block');
                }
            }
        }
        const currentContent = this.editor.innerText || '';
        this.isModified = currentContent !== this.lastSavedContent;
        this.ui.updateStatusIndicator(this.isModified);
        this.ui.updateStatistics();
    }
    processBlock(block) {
        const text = block.textContent || '';
        const wasActive = block.classList.contains('active-block');
        // Clear previous structural classes
        block.classList.remove('md-block-h1', 'md-block-h2', 'md-block-h3', 'md-block-quote', 'md-block-ul', 'md-block-ol', 'md-block-hr', 'doc-title', 'nota-line');
        // Use utility to format
        const isFirstLine = block === this.editor.firstElementChild;
        const { className, html } = MarkdownUtils.formatLine(text, isFirstLine);
        if (className) {
            block.classList.add(className);
        }
        // Only update innerHTML if it changed, to preserve cursor if possible? 
        // Although saveAndRestoreSelection handles it.
        // We compare content.
        if (block.innerHTML !== html) {
            this.saveAndRestoreSelection(block, () => {
                block.innerHTML = html;
                // Setup event listeners for nota annotations
                if (className === 'nota-line') {
                    this.setupNotaAnnotationListeners(block);
                }
            });
        }
        else if (className === 'nota-line') {
            // Even if HTML didn't change, ensure listeners are set up
            this.setupNotaAnnotationListeners(block);
        }
        if (wasActive && !block.classList.contains('active-block')) {
            block.classList.add('active-block');
        }
    }
    setupNotaAnnotationListeners(block) {
        const annotationSpan = block.querySelector('[data-nota-annotation="true"]');
        if (annotationSpan && !annotationSpan.dataset.listenersAttached) {
            // Mark as having listeners to avoid duplicate attachments
            annotationSpan.dataset.listenersAttached = 'true';
            // Prevent the annotation from triggering full block reprocessing
            annotationSpan.addEventListener('input', (e) => {
                e.stopPropagation();
                // Just mark as modified without reprocessing
                const currentContent = this.editor.innerText || '';
                this.isModified = currentContent !== this.lastSavedContent;
                this.ui.updateStatusIndicator(this.isModified);
                this.ui.updateStatistics();
            });
        }
    }
    saveAndRestoreSelection(block, action) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            action();
            return;
        }
        const savedRange = sel.getRangeAt(0);
        // Calculate offset in plain text
        const preRange = document.createRange();
        preRange.selectNodeContents(block);
        // Ensure the end is valid (sometimes it's outside?)
        try {
            preRange.setEnd(savedRange.endContainer, savedRange.endOffset);
        }
        catch (e) {
            // Fallback if range is invalid relative to block
            action();
            return;
        }
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
    findTextNodeAt(element, offset) {
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
        return null;
    }
    handleEditorKeydown(e) {
        // Handle Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                document.execCommand('insertParagraph');
                return;
            }
            // Find current block
            let currentBlock = sel.anchorNode;
            if (currentBlock.nodeType === Node.TEXT_NODE) {
                currentBlock = currentBlock.parentNode;
            }
            while (currentBlock && currentBlock.parentNode !== this.editor && currentBlock !== this.editor) {
                currentBlock = currentBlock.parentNode;
            }
            if (!currentBlock || currentBlock === this.editor) {
                document.execCommand('insertParagraph');
                return;
            }
            const block = currentBlock;
            const text = block.textContent || '';
            // Check if we're in an unordered list
            if (block.classList.contains('md-block-ul')) {
                const match = text.match(/^(\s*)([-*+])\s+(.*)$/);
                if (match) {
                    const indent = match[1];
                    const marker = match[2];
                    const content = match[3];
                    // If content is empty, exit the list
                    if (!content.trim()) {
                        // Remove current empty list item
                        block.remove();
                        // Create clean paragraph
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = '<br>';
                        this.editor.appendChild(newDiv);
                        // Move cursor to new line
                        const range = document.createRange();
                        range.setStart(newDiv, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        return;
                    }
                    // Create new list item
                    const newDiv = document.createElement('div');
                    newDiv.textContent = `${indent}${marker} `;
                    block.after(newDiv);
                    // Move cursor to new list item
                    const range = document.createRange();
                    const textNode = newDiv.firstChild;
                    range.setStart(textNode, newDiv.textContent.length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    // Process the new block
                    this.processBlock(newDiv);
                    return;
                }
            }
            // Check if we're in a nota annotation line
            if (block.classList.contains('nota-line')) {
                // Exit nota annotation mode - create clean paragraph
                const newDiv = document.createElement('div');
                newDiv.innerHTML = '<br>';
                block.after(newDiv);
                // Move cursor to new line
                const range = document.createRange();
                range.setStart(newDiv, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            // Check if we're in an ordered list
            if (block.classList.contains('md-block-ol')) {
                const match = text.match(/^(\s*)(\d+)\.\s+(.*)$/);
                if (match) {
                    const indent = match[1];
                    const number = parseInt(match[2], 10);
                    const content = match[3];
                    // If content is empty, exit the list
                    if (!content.trim()) {
                        // Remove current empty list item
                        block.remove();
                        // Create clean paragraph
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = '<br>';
                        this.editor.appendChild(newDiv);
                        // Move cursor to new line
                        const range = document.createRange();
                        range.setStart(newDiv, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        return;
                    }
                    // Create new list item with next number
                    const newDiv = document.createElement('div');
                    newDiv.textContent = `${indent}${number + 1}. `;
                    block.after(newDiv);
                    // Move cursor to new list item
                    const range = document.createRange();
                    const textNode = newDiv.firstChild;
                    range.setStart(textNode, newDiv.textContent.length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    // Process the new block
                    this.processBlock(newDiv);
                    return;
                }
            }
            // Default behavior - create new paragraph
            document.execCommand('insertParagraph');
        }
    }
}
new TextEditorRenderer();
