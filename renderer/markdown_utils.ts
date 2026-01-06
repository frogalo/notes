/**
 * Markdown Processing Utilities
 */
export class MarkdownUtils {
    /**
     * Convert full text to formatted HTML lines (for initial load)
     */
    static formatAllContent(text: string): string {
        if (!text) return '<div><br></div>';
        return text.split('\n').map((line, index) => {
            const { className, html } = this.formatLine(line, index === 0);
            return `<div class="${className}">${html || '<br>'}</div>`;
        }).join('');
    }

    /**
     * Process a single line and return its class and HTML content
     */
    static formatLine(text: string, isFirstLine: boolean = false): { className: string, html: string } {
        let html = this.escapeHtml(text);
        let className = '';

        // 0. Title (First Line)
        if (isFirstLine) {
            className = 'doc-title';
            return { className, html };
        }

        // 1. Headers (Block Level)
        const headerMatch = text.match(/^(#{1,3})\s+(.*)$/);
        if (headerMatch) {
            className = `md-block-h${headerMatch[1].length}`;
            const contentHtml = this.applyInlineFormatting(this.escapeHtml(headerMatch[2]));
            html = `<span class="md-syntax">${headerMatch[1]} </span>${contentHtml}`;
            return { className, html };
        }

        // 2. Blockquote
        if (text.startsWith('>')) {
            className = 'md-block-quote';
            const content = text.startsWith('> ') ? text.substring(2) : text.substring(1);
            html = `<span class="md-syntax">&gt; </span>${this.applyInlineFormatting(this.escapeHtml(content))}`;
            return { className, html };
        }

        // Horizontal Rule
        if (/^(\*{3,}|-{3,}|_{3,})$/.test(text)) {
            className = 'md-block-hr';
            html = `<span class="md-syntax">${html}</span>`;
            return { className, html };
        }

        // 3. Unordered List
        if (/^\s*[-*+]\s+/.test(text)) {
            className = 'md-block-ul';
            const match = text.match(/^(\s*)([-*+])\s+(.*)$/);
            if (match) {
                const indent = match[1];
                const marker = match[2];
                const content = match[3];
                html = `<span class="md-list-marker md-list-marker-ul">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                return { className, html };
            }
        }

        // 4. Ordered List
        if (/^\s*\d+\.\s+/.test(text)) {
            className = 'md-block-ol';
            const match = text.match(/^(\s*)(\d+\.)\s+(.*)$/);
            if (match) {
                const indent = match[1];
                const marker = match[2];
                const content = match[3];
                html = `<span class="md-list-marker md-list-marker-ol">${this.escapeHtml(indent + marker)} </span><span>${this.applyInlineFormatting(this.escapeHtml(content))}</span>`;
                return { className, html };
            }
        }

        // Default: Inline Formatting
        html = this.applyInlineFormatting(html);

        return { className, html };
    }

    /**
     * Apply inline formatting (Bold/Italic/Code)
     */
    static applyInlineFormatting(text: string): string {
        let html = text;
        const replacements: string[] = [];
        const pushReplacement = (str: string) => {
            const token = `__MD_TOKEN_${replacements.length}__`;
            replacements.push(str);
            return token;
        };

        // 1. Code: `text`
        html = html.replace(/(`)([^`]+)(`)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-code">${content}</span><span class="md-syntax">${suffix}</span>`);
        });

        // 2. Autolinks
        html = html.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, (match, url) => {
            return pushReplacement(`<span class="md-syntax">&lt;</span><a href="${url}" class="md-link">${url}</a><span class="md-syntax">&gt;</span>`);
        });
        html = html.replace(/&lt;([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)&gt;/g, (match, email) => {
            return pushReplacement(`<span class="md-syntax">&lt;</span><a href="mailto:${email}" class="md-link">${email}</a><span class="md-syntax">&gt;</span>`);
        });

        // 3. Links
        html = html.replace(/\[([^\]]+)\]\(([^ )]+)\s+"([^"]+)"\)/g, (match, label, url, title) => {
            const formattedLabel = this.applyInlineFormatting(label);
            return pushReplacement(
                `<span class="md-syntax">[</span>` +
                `<a href="${url}" title="${title}" class="md-link">${formattedLabel}</a>` +
                `<span class="md-syntax">](${url} "${title}")</span>`
            );
        });
        html = html.replace(/\[([^\]]+)\]\(([^ )]+)\)/g, (match, label, url) => {
            const formattedLabel = this.applyInlineFormatting(label);
            return pushReplacement(
                `<span class="md-syntax">[</span>` +
                `<a href="${url}" class="md-link">${formattedLabel}</a>` +
                `<span class="md-syntax">](${url})</span>`
            );
        });

        // 4. Bold+Italic
        html = html.replace(/(\*\*\*)(.+?)(\*\*\*)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-bold md-italic">${content}</span><span class="md-syntax">${suffix}</span>`);
        });

        // 5. Bold
        html = html.replace(/(\*\*)(.+?)(\*\*)/g, (match, prefix, content, suffix) => {
            return pushReplacement(`<span class="md-syntax">${prefix}</span><span class="md-bold">${content}</span><span class="md-syntax">${suffix}</span>`);
        });

        // 6. Italic
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
    static escapeHtml(text: string): string {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
