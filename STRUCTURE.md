# Project Structure

```
notes-editor/
│
├── src/                          # Main process source files (TypeScript)
│   ├── main.ts                  # Main Electron process entry point
│   ├── preload.ts               # Secure IPC bridge
│   └── types.d.ts               # TypeScript type definitions
│
├── renderer/                     # Renderer process files (UI)
│   ├── index.html               # HTML structure
│   ├── styles.css               # Styling (modern dark theme)
│   ├── renderer.ts              # Renderer logic (TypeScript)
│   ├── renderer.js              # Compiled renderer (generated)
│   └── tsconfig.json            # TypeScript config for renderer
│
├── dist/                         # Compiled main process files (generated)
│   ├── main.js                  # Compiled from src/main.ts
│   └── preload.js               # Compiled from src/preload.ts
│
├── release/                      # Packaged applications (generated)
│   └── (AppImage, .deb files)
│
├── node_modules/                 # Dependencies
│
├── .gitignore                    # Git ignore rules
├── package.json                  # Project configuration
├── package-lock.json             # Dependency lock file
├── tsconfig.json                 # TypeScript config for main process
└── README.md                     # Documentation

```

## Architecture Overview

### Clean Code Principles Applied

1. **Separation of Concerns**
   - Main process (`src/main.ts`) handles system-level operations
   - Preload script (`src/preload.ts`) provides secure API bridge
   - Renderer process (`renderer/renderer.ts`) manages UI logic

2. **Single Responsibility**
   - Each class and method has one clear purpose
   - File operations are isolated in the main process
   - UI logic is completely separated from backend logic

3. **Encapsulation**
   - `TextEditorApp` class encapsulates all main process logic
   - `TextEditorRenderer` class encapsulates all renderer logic
   - Private methods clearly indicate internal implementation

4. **Type Safety**
   - Full TypeScript implementation
   - Shared type definitions in `types.d.ts`
   - Strict compiler options enabled

5. **Security First**
   - Context isolation enabled
   - Node integration disabled
   - Minimal API surface exposed via contextBridge
   - Content Security Policy implemented

6. **Documentation**
   - JSDoc comments for all classes and methods
   - Clear inline comments explaining complex logic
   - Comprehensive README

7. **Error Handling**
   - Try-catch blocks for all file operations
   - User-friendly error messages
   - Graceful failure handling

## File Descriptions

### Source Files (TypeScript)

- **`src/main.ts`** - Main Electron process
  - Creates and manages application windows
  - Handles file system operations (read, write)
  - Implements IPC handlers for file dialogs
  - Manages application lifecycle

- **`src/preload.ts`** - Preload script
  - Exposes secure APIs to renderer using contextBridge
  - Prevents direct Node.js access from renderer
  - Type-safe IPC communication

- **`src/types.d.ts`** - TypeScript definitions
  - Shared interfaces and types
  - Global type augmentation for Window object

### Renderer Files

- **`renderer/index.html`** - Application structure
  - Semantic HTML5
  - Toolbar with file operation buttons
  - Main text editor textarea
  - Status bar with statistics

- **`renderer/styles.css`** - Styling
  - CSS custom properties for theming
  - Modern dark theme
  - Responsive design
  - Custom scrollbar styling

- **`renderer/renderer.ts`** - UI logic
  - Class-based architecture
  - Event handling (clicks, keyboard shortcuts)
  - File operation coordination
  - Real-time statistics calculation

### Configuration Files

- **`package.json`** - Project metadata and scripts
- **`tsconfig.json`** - TypeScript config for main process
- **`renderer/tsconfig.json`** - TypeScript config for renderer
- **`.gitignore`** - Version control exclusions

## Data Flow

```
User Action (UI)
    ↓
Renderer Process (renderer.ts)
    ↓
Electron API (window.electronAPI)
    ↓
Preload Script (contextBridge)
    ↓
IPC Communication
    ↓
Main Process (main.ts)
    ↓
File System / OS
```

## Security Model

1. **Context Isolation** - Renderer has no direct access to Node.js
2. **Preload Script** - Only whitelisted APIs exposed
3. **IPC Validation** - All inputs validated in main process
4. **CSP Headers** - Restricts script and style sources
5. **No Eval** - Strict mode, no dynamic code execution

## Development Workflow

1. Edit TypeScript files in `src/` or `renderer/`
2. Run `npm run build` to compile
3. Run `npm run dev` to test
4. Use `npm run watch` for automatic recompilation
5. Package with `npm run package:linux` when ready

## Best Practices Implemented

- ✅ TypeScript for type safety
- ✅ Class-based architecture
- ✅ Clear naming conventions
- ✅ Comprehensive error handling
- ✅ Security-first approach
- ✅ Modular file structure
- ✅ Documentation at all levels
- ✅ Responsive UI design
- ✅ Accessibility considerations
