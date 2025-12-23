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

    // Escape key to exit fullscreen
    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape' && win.isFullScreen()) {
            win.setFullScreen(false);
        }
    });
}

app.whenReady().then(() => {
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
