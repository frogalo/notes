import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Main process for the Electron text editor application
 * Handles window management and file operations
 */
class TextEditorApp {
    private mainWindow: BrowserWindow | null = null;
    private currentFilePath: string | null = null;

    constructor() {
        this.initializeApp();
    }

    /**
     * Initialize the Electron application
     */
    private initializeApp(): void {
        app.on('ready', () => this.createWindow());
        app.on('window-all-closed', () => this.handleWindowsClosed());
        app.on('activate', () => this.handleActivate());
        this.setupIpcHandlers();
    }

    /**
     * Create the main application window
     */
    private createWindow(): void {
        // Remove default menu
        Menu.setApplicationMenu(null);

        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            },
            title: 'Notes Editor',
            backgroundColor: '#1e1e1e',
        });

        this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

        // Open DevTools in development
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    /**
     * Handle all windows being closed
     */
    private handleWindowsClosed(): void {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    /**
     * Handle app activation (macOS)
     */
    private handleActivate(): void {
        if (this.mainWindow === null) {
            this.createWindow();
        }
    }

    /**
     * Setup IPC handlers for renderer communication
     */
    private setupIpcHandlers(): void {
        // Open file dialog
        ipcMain.handle('dialog:openFile', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'Text Files', extensions: ['txt', 'md', 'js', 'ts', 'json', 'html', 'css'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });

            if (result.canceled || result.filePaths.length === 0) {
                return null;
            }

            this.currentFilePath = result.filePaths[0];
            return this.readFile(this.currentFilePath);
        });

        // Save file dialog
        ipcMain.handle('dialog:saveFile', async (_, content: string) => {
            let filePath = this.currentFilePath;

            if (!filePath) {
                const result = await dialog.showSaveDialog({
                    filters: [
                        { name: 'Text Files', extensions: ['txt'] },
                        { name: 'Markdown Files', extensions: ['md'] },
                        { name: 'All Files', extensions: ['*'] },
                    ],
                });

                if (result.canceled || !result.filePath) {
                    return { success: false, error: 'Save cancelled' };
                }

                filePath = result.filePath;
                this.currentFilePath = filePath;
            }

            return this.writeFile(filePath, content);
        });

        // Save file as
        ipcMain.handle('dialog:saveFileAs', async (_, content: string) => {
            const result = await dialog.showSaveDialog({
                filters: [
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'Markdown Files', extensions: ['md'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });

            if (result.canceled || !result.filePath) {
                return { success: false, error: 'Save cancelled' };
            }

            this.currentFilePath = result.filePath;
            return this.writeFile(result.filePath, content);
        });

        // New file
        ipcMain.handle('file:new', () => {
            this.currentFilePath = null;
            return { success: true };
        });

        // Load help content
        ipcMain.handle('content:loadHelp', () => {
            return this.loadJsonFile(path.join(__dirname, '../data/help.json'));
        });

        // Load changelog content
        ipcMain.handle('content:loadChangelog', () => {
            return this.loadJsonFile(path.join(__dirname, '../data/changelog.json'));
        });
    }

    /**
     * Load and parse JSON file
     */
    private loadJsonFile(filePath: string): any {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Failed to load JSON file: ${filePath}`, error);
            return null;
        }
    }

    /**
     * Read file contents
     */
    private readFile(filePath: string): { success: boolean; content?: string; filePath?: string; error?: string } {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return { success: true, content, filePath };
        } catch (error) {
            return { success: false, error: `Failed to read file: ${error}` };
        }
    }

    /**
     * Write file contents
     */
    private writeFile(filePath: string, content: string): { success: boolean; filePath?: string; error?: string } {
        try {
            fs.writeFileSync(filePath, content, 'utf-8');
            return { success: true, filePath };
        } catch (error) {
            return { success: false, error: `Failed to write file: ${error}` };
        }
    }
}

// Initialize the application
new TextEditorApp();
