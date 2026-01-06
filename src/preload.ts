import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes only necessary APIs to the renderer process
 */

// Type definitions for exposed API
export interface FileResult {
    success: boolean;
    content?: string;
    filePath?: string;
    error?: string;
}

export interface ElectronAPI {
    openFile: () => Promise<FileResult | null>;
    saveFile: (content: string) => Promise<FileResult>;
    saveFileAs: (content: string) => Promise<FileResult>;
    newFile: () => Promise<FileResult>;
}

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Open file dialog and read file
     */
    openFile: (): Promise<FileResult | null> => {
        return ipcRenderer.invoke('dialog:openFile');
    },

    /**
     * Save file (use current path or prompt)
     */
    saveFile: (content: string, suggestedName?: string): Promise<FileResult> => {
        return ipcRenderer.invoke('dialog:saveFile', content, suggestedName);
    },

    /**
     * Save file as (always prompt for location)
     */
    saveFileAs: (content: string): Promise<FileResult> => {
        return ipcRenderer.invoke('dialog:saveFileAs', content);
    },

    /**
   * Create new file
   */
    newFile: (): Promise<FileResult> => {
        return ipcRenderer.invoke('file:new');
    },

    /**
     * Load help content
     */
    loadHelp: (): Promise<any> => {
        return ipcRenderer.invoke('content:loadHelp');
    },

    /**
     * Load changelog content
     */
    loadChangelog: (): Promise<any> => {
        return ipcRenderer.invoke('content:loadChangelog');
    },
} as ElectronAPI);
