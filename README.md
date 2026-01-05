# Notes Editor

A clean, modern text editor built with Electron and TypeScript for Linux.

## Features

- 📝 **Simple Text Editing** - Distraction-free writing experience
- 💾 **File Operations** - Open, save, and create new files
- 🎨 **Modern Dark UI** - Easy on the eyes with a sleek design
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with common shortcuts
- 📊 **Live Statistics** - Real-time word, character, and line count
- 🖥️ **Cross-Platform** - Built for Linux, but works on other platforms too

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
│   └── renderer.ts       # Renderer process (UI logic)
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

## Building

### Compile TypeScript

```bash
npm run build
```

### Package for Linux

```bash
npm run package:linux
```

This will create distributable packages in the `release/` directory:
- `.AppImage` - Portable application
- `.deb` - Debian/Ubuntu package

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New File |
| `Ctrl+O` | Open File |
| `Ctrl+S` | Save File |
| `Ctrl+Shift+S` | Save As |

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

## Clean Code Principles Applied

1. **Separation of Concerns** - Main, preload, and renderer are clearly separated
2. **Class-Based Architecture** - Encapsulation of logic in classes
3. **Type Safety** - Full TypeScript support with proper type definitions
4. **Security** - Context isolation and minimal API exposure
5. **Documentation** - Comprehensive JSDoc comments
6. **Modularity** - Each file has a single, clear responsibility
7. **Error Handling** - Proper try-catch blocks and user feedback

## Security Features

- **Context Isolation** - Prevents renderer from accessing Node.js directly
- **No Node Integration** - Renderer process runs in a sandboxed environment
- **Content Security Policy** - Restricts resource loading
- **Minimal API Surface** - Only essential functions exposed to renderer

## License

MIT

## Author

Jakub Urbański
