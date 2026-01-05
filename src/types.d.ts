/**
 * Type definitions for Electron API in renderer process
 */

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
    loadHelp: () => Promise<any>;
    loadChangelog: () => Promise<any>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
