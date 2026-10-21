const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_PORT = process.env.PORT || 3000;

let mainWindow;
let server;

async function startServer() {
  if (isDev) {
    return `http://localhost:${DEV_PORT}`;
  }

  // In production, boot the in-process Next.js server
  const next = require('next');
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname, '..'),
  });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      handle(req, res);
    });

    // Listen on dynamic available port bound to localhost only
    server.listen(0, '127.0.0.1', () => {
      const assignedPort = server.address().port;
      resolve(`http://127.0.0.1:${assignedPort}`);
    });

    server.on('error', reject);
  });
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 850,
    minHeight: 600,
    title: 'Guitar App',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
  });

  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const url = await startServer();
    createWindow(url);
  } catch (err) {
    console.error('Failed to start application:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startServer().then((url) => createWindow(url));
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
