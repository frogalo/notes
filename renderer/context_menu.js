export class ContextMenu {
    constructor(editor) {
        this.editor = editor;
        this.contextMenu = document.getElementById('context-menu');
        this.setup();
    }
    setup() {
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
}
