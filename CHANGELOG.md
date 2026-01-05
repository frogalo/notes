# 🚀 Changelog

All notable changes to the **Notes Editor** project will be documented in this file.

---

## [0.2.3] - 2026-01-05
### ✨ Added
- **Context Menu:** Custom right-click menu with Cut, Copy.

---

# 💾 v0.3.0 - Persistence Update
> *A major stability update ensuring data integrity and enhanced editing tools.*

### ✨ Added
- **Context Paste:** Right-click context menu now supports pasting from clipboard.
- **Typography:** distinct styling for **Bold**, *Italic*, and ***Both*** for better readability.

### 🛡️ Fixed
- **Markdown Persistence:** Fixed critical issue where markdown syntax was lost on save. Files now save exactly as written.

---

## [0.2.1] - 2026-01-05
### 💅 Modernization
- **Refreshed Changelog:** Updated this file to use a clean, modern customized format.
- **Milestone Tracking:** Added visual distinction for major releases (v0.1.0, v0.2.0).

---

# 🔗 v0.2.0 - Hypertext Update
> *A major update introducing comprehensive link support and interactivity.*

### ✨ Added
- **Standard Links:** Support for `[text](url)` syntax.
- **Title Links:** Support for `[text](url "title")` with hover tooltips.
- **Autolinks:** Support for `<url>` and `<email>` syntax.
- **Interactivity:** Links are clickable (Ctrl+Click) and support nested formatting.

---

## [0.1.10] - 2026-01-05
### ✨ Added
- **Horizontal Rules:** Support for `---`, `***`, `___` as stylized separators.

## [0.1.9] - 2026-01-05
### ✨ Added
- **Inline Code:** Support for `code` blocks with 'Encode Sans SC' font and custom background.

## [0.1.8] - 2026-01-05
### 🐛 Fixed
- **List Styling:** Fixed critical bug where list bullets floated in the center of the screen.

## [0.1.7] - 2026-01-05
### 🐛 Fixed
- **Editor Logic:** Pressing Enter now cleanly exits Headers, Lists, and Quotes.

## [0.1.6] - 2026-01-05
### ✨ Added
- **Lists:** Full support for Ordered (`1.`) and Unordered (`-`) lists with Tailwind-inspired styling.

## [0.1.5] - 2026-01-05
### 🐛 Fixed
- **Formatting:** Fixed bold text color in headers and complex bold+italic rendering.

## [0.1.4] - 2026-01-05
### 🛡️ Core
- **Tokenizer Engine:** Implemented robust tokenizer to prevent regex collisions during formatting.

## [0.1.3] - 2026-01-05
### 🐛 Fixed
- **Formatting:** Resolved text visibility issues with ambiguous syntax.
### ✨ Added
- **Blockquotes:** Support for multi-line blockquotes.

## [0.1.2] - 2026-01-05
### ✨ WYSIWYG
- **True WYSIWYG:** Syntax characters are now hidden automatically when not editing.

## [0.1.1] - 2026-01-05
### ✨ Live Highlighting
- **Live Preview:** formatting is applied in-place (Discord-style).

---

# 👁️ v0.1.0 - Live Preview
> *A significant release introducing real-time Markdown rendering.*

### ✨ Added
- **Live Preview Mode:** Toggle formatting via toolbar.
- **Syntax Support:** Headers, Lists, Images, Links.
- **Split View:** Side-by-side editing.

---

## [0.0.5] - 2026-01-05
### 🔧 Polish
- Swapped toolbar buttons for better ergonomics.
- Improved dark mode contrast.

## [0.0.4] - 2026-01-05
### 🔧 UI
- Moved filename and buttons.
- Enhanced unsaved changes indicator.

## [0.0.3] - 2026-01-05
### ✨ Fonts
- Added Font Switcher (Headland One, Rajdhani, Noto Sans).

## [0.0.2] - 2026-01-05
### ✨ System
- Added in-app Help and Changelog viewers.
- Implemented custom typography system.

---

# 🎉 v0.0.1 - Initial Release
> *The foundation of the secure, modern Notes Editor.*

### ✨ Features
- **Core Editor:** Text editing with stats.
- **File Ops:** New, Open, Save, Save As.
- **Security:** Context isolation implementation.
- **Architecture:** TypeScript + Electron.
