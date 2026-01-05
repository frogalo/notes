# Quick Start Guide

## Running the Application

### For the First Time

```bash
# Navigate to project directory
cd /home/kuba/Antigravity/notes

# Install dependencies (if not already done)
npm install

# Build the application
npm run build

# Run the application
npm start
```

### Development Mode

```bash
# Build and run in one command
npm run dev
```

### Auto-recompile (Recommended for Development)

**Terminal 1:**
```bash
npm run watch
```

**Terminal 2:**
```bash
npm start
```

## Using the Text Editor

### Keyboard Shortcuts

- **Ctrl+N** - Create a new file
- **Ctrl+O** - Open an existing file
- **Ctrl+S** - Save the current file
- **Ctrl+Shift+S** - Save as (choose new location)
- **Tab** - Insert 2 spaces (not a tab character)

### Features

1. **New File** - Click the "New" button or press Ctrl+N
2. **Open File** - Click "Open" or press Ctrl+O to browse for a file
3. **Save** - Click "Save" or press Ctrl+S
4. **Save As** - Click "Save As" or press Ctrl+Shift+S

### Status Indicators

- **File Path** - Displays the current file name (top right)
- **Status Dot** 
  - Orange = Modified (unsaved changes)
  - Green pulse = Just saved
  - Hidden = No changes
- **Statistics Bar** (bottom)
  - Lines count
  - Characters count
  - Words count

## Packaging for Distribution

### Create Linux Packages

```bash
# Build AppImage and .deb packages
npm run package:linux
```

The packages will be created in the `release/` directory:
- `notes-editor-0.1.0.AppImage` - Portable application
- `notes-editor_0.1.0_amd64.deb` - Debian/Ubuntu installer

### Installing the Package

**AppImage:**
```bash
chmod +x release/notes-editor-0.1.0.AppImage
./release/notes-editor-0.1.0.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i release/notes-editor_0.1.0_amd64.deb
```

## Troubleshooting

### Application won't start

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Rebuild the TypeScript files:
   ```bash
   npm run build
   ```

3. Check for errors:
   ```bash
   npm run dev 2>&1 | grep -i error
   ```

### GTK/Graphics warnings

These are common on Linux and usually harmless:
- `GetVSyncParametersIfAvailable() failed`
- `GLib-GObject: invalid cast`

They don't affect functionality - the app will work normally.

### File operations not working

1. Check file permissions in directories you're trying to read/write
2. Look for error messages in the console (if running from terminal)

## System Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 10+, or equivalent)
- **Node.js**: v16 or higher
- **Memory**: 512MB minimum
- **Disk Space**: 200MB for dependencies and application

## Supported File Types

The editor can open any text file, with filters for:
- `.txt` - Plain text
- `.md` - Markdown
- `.js`/`.ts` - JavaScript/TypeScript
- `.json` - JSON files
- `.html`/`.css` - Web files
- `*` - All files

## Tips

1. **Dark Theme** - The editor uses a dark theme by default, easy on the eyes
2. **Auto-save indicator** - Watch the status dot to know when your file is saved
3. **Real-time stats** - The bottom bar updates as you type
4. **Tab spacing** - Tabs are converted to 2 spaces for consistent formatting

## Next Steps

- Customize colors in `renderer/styles.css`
- Add more keyboard shortcuts in `renderer/renderer.ts`
- Extend functionality in `src/main.ts`
- Package and distribute your customized version

Enjoy your new text editor! 🎉
