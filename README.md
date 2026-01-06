# Notes Editor

A clean, modern text editor built with Electron and TypeScript, featuring robust Markdown support and a sleek dark UI.

## Features

- 📝 **Simple Text Editing** - Distraction-free writing experience.
- ⚡ **Markdown Support** - Live preview, headers, lists, links, and code highlighting (`**bold**`, `*italic*`, etc.).
- 🔗 **Rich Interaction** - Clickable links, email autolinks, and hover tooltips.
- 🖱️ **Context Menu** - Right-click to Cut, Copy, and **Paste**.
- 💾 **File Operations** - Open, save, and create new files with perfect formatting persistence.
- 🎨 **Modern Dark UI** - Easy on the eyes with Glassmorphism elements and Tailwind-inspired design.
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with common shortcuts.
- 📊 **Live Statistics** - Real-time word, character, and line count.
- 🖥️ **Cross-Platform** - Works on Linux and Windows.

## Project Structure

```
notes-editor/
├── src/
│   ├── main.ts           # Main process (Electron backend)
│   ├── preload.ts        # Preload script (secure IPC bridge)
│   └── types.d.ts        # TypeScript type definitions
├── renderer/
│   ├── index.html        # HTML structure
│   ├── styles.css        # Styling
│   ├── renderer.ts       # Renderer process (UI logic)
│   ├── ui_manager.ts     # UI management module
│   ├── markdown_utils.ts # Markdown parsing utilities
│   └── context_menu.ts   # Context menu logic
├── data/
│   ├── help.json         # Help content
│   └── changelog.json    # Version history
├── dist/                 # Compiled JavaScript (generated)
├── release/              # Packaged applications (generated)
├── package.json          # Project configuration
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone or navigate to the project directory**

```bash
cd /home/kuba/Antigravity/notes
```

2. **Install dependencies**

```bash
npm install
```

## Development

### Run in development mode

```bash
npm run dev
```

This will:

1. Compile TypeScript files to JavaScript
2. Launch the Electron application

### Watch mode (auto-recompile on changes)

In a separate terminal, run:

```bash
npm run watch
```

Then in another terminal:

```bash
npm start
```

## Building & Packaging

### Compile TypeScript

```bash
npm run build
```

### Package for Linux

```bash
npm run package:linux
```

This will create distributable packages in the `release/` directory:

- **.AppImage** - Portable application (runs on most Linux distros)
- **.deb** - Debian/Ubuntu package

### Package for Windows

```bash
npm run package:win
```

This will create Windows installers in the `release/` directory:

- **NSIS Installer** - Standard Windows installer with customization options
- **Portable** - Standalone executable that doesn't require installation

### Package for All Platforms

```bash
npm run package:all
```

Builds for both Linux and Windows simultaneously.

### Arch Linux / AUR Support

While this package is not yet officially hosted on the AUR, you can easily install it on Arch Linux using one of the following methods:

#### Method 1: AppImage (Universal)

1. Build the AppImage: `npm run package:linux`
2. Locate the file in `release/Notes Editor-x.x.x.AppImage`.
3. Make it executable: `chmod +x release/*.AppImage`
4. Run it directly: `./release/Notes Editor-x.x.x.AppImage` (or double click).

#### Method 2: Convert .deb using `debtap`

If you prefer a native package manager installation:

1. Install `debtap` from AUR: `yay -S debtap`
2. Update debtap database: `sudo debtap -u`
3. Build the .deb package: `npm run package:linux`
4. Convert the .deb:
   ```bash
   debtap release/notes-editor_0.5.0_amd64.deb
   ```
5. Install the generated package: `sudo pacman -U notes-editor-*.pkg.tar.zst`

## Keyboard Shortcuts

| Shortcut       | Action          |
| -------------- | --------------- |
| `Ctrl+N`       | New File        |
| `Ctrl+O`       | Open File       |
| `Ctrl+S`       | Save File       |
| `Ctrl+Shift+S` | Save As         |
| `Tab`          | Insert 2 Spaces |

## Architecture

### Main Process (`src/main.ts`)

- Manages application lifecycle
- Creates and controls windows
- Handles file system operations
- Implements IPC handlers

### Preload Script (`src/preload.ts`)

- Secure bridge between main and renderer processes
- Exposes safe APIs using `contextBridge`
- Prevents direct access to Node.js APIs

### Renderer Process (`renderer/`)

- User interface and interactions
- Communicates with main process via exposed APIs
- Handles editor state and statistics

## Security Features

- **Context Isolation** - Prevents renderer from accessing Node.js directly
- **No Node Integration** - Renderer process runs in a sandboxed environment
- **Content Security Policy** - Restricts resource loading
- **Minimal API Surface** - Only essential functions exposed to renderer

## License

MIT

## Author

Jakub Urbański
