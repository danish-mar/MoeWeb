const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadURL: (url) => ipcRenderer.send('load-url', url),
    windowControl: (action) => {
        switch(action) {
            case 'close':
                ipcRenderer.send('window-close');
                break;
            case 'minimize':
                ipcRenderer.send('window-minimize');
                break;
            case 'maximize':
                ipcRenderer.send('window-maximize');
                break;
        }
    }
});
