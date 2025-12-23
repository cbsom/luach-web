const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    quit: () => ipcRenderer.send('quit-app'),
    // New: Request Google Login via system browser
    signInWithGoogle: () => ipcRenderer.invoke('google-sign-in')
});
