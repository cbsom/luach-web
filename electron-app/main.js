const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        fullscreen: true,
        title: "Luach - Jewish Calendar",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        // Icon path (relative to this file)
        icon: path.join(__dirname, '../public/icon.png')
    });

    // Decide whether to load dev server or local file
    const isDev = process.argv.includes('--dev');

    // EXTREME SPOOF: Remove Electron identity from headers
    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        const { requestHeaders } = details;
        delete requestHeaders['X-Requested-With'];
        delete requestHeaders['X-Electron-Process-Type'];
        callback({ requestHeaders });
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        // Load the production build
        // When packaged, dist is copied inside the app root
        const indexPath = app.isPackaged
            ? path.join(__dirname, 'dist', 'index.html')
            : path.join(__dirname, '../dist/index.html');

        win.loadFile(indexPath).catch(err => {
            console.error("Failed to load local index.html:", err);
            // Fallback for development if build is missing
            win.loadURL('http://localhost:5173').catch(() => {
                console.log("Dev server also not available.");
            });
        });
    }

    // Remove default menu for a cleaner look
    Menu.setApplicationMenu(null);

    // FIX: Handle Google Auth Popups in Electron
    const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';
    win.webContents.setUserAgent(firefoxUA);

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('google.com') || url.includes('firebase') || url.includes('firebaseapp.com')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    autoHideMenuBar: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        userAgent: firefoxUA
                    }
                }
            };
        }
        return { action: 'allow' };
    });

    // Escape key to exit fullscreen
    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape' && win.isFullScreen()) {
            win.setFullScreen(false);
        }
    });
}

app.whenReady().then(() => {
    // Set global fallback to a clean Firefox identity
    app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle quit request from UI
ipcMain.on('quit-app', () => {
    app.quit();
});
