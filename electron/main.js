const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_PORT = process.env.PORT || 3000;

let mainWindow;
let server;

function createSplashHTML() {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Guitar App</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #09090b;
          color: #f4f4f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .icon-container {
          width: 90px;
          height: 90px;
          border-radius: 24px;
          background: #18181b;
          border: 1px solid #27272a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: pulse 2s infinite ease-in-out;
        }
        .icon {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
          color: #ffffff;
        }
        p {
          font-size: 13px;
          color: #a1a1aa;
          margin: 0;
        }
        .bar {
          width: 140px;
          height: 3px;
          background: #27272a;
          border-radius: 99px;
          margin-top: 24px;
          overflow: hidden;
          position: relative;
        }
        .bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 50%;
          background: #f59e0b;
          border-radius: 99px;
          animation: slide 1.2s infinite ease-in-out;
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      </style>
    </head>
    <body>
      <div class="icon-container">
        <img src="icon.png" class="icon" onerror="this.style.display='none'">
      </div>
      <h1>Guitar App</h1>
      <p>Başlatılıyor...</p>
      <div class="bar"></div>
    </body>
  </html>`;
}

async function startServer() {
  if (isDev) {
    return `http://localhost:${DEV_PORT}`;
  }

  const next = require('next');
  const appDir = path.join(__dirname, '..');

  const nextApp = next({
    dev: false,
    dir: appDir,
  });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(0, '127.0.0.1', () => {
      const assignedPort = server.address().port;
      resolve(`http://127.0.0.1:${assignedPort}`);
    });

    server.on('error', reject);
  });
}

function createWindow() {
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
    show: false,
  });

  // Load splash screen immediately
  const splashData = 'data:text/html;charset=utf-8,' + encodeURIComponent(createSplashHTML());
  mainWindow.loadURL(splashData);
  mainWindow.show();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  createWindow();

  try {
    const url = await startServer();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(url);
    }
  } catch (err) {
    console.error('Failed to start application:', err);
    dialog.showErrorBox(
      'Guitar App Başlatma Hatası',
      'Uygulama başlatılırken bir hata oluştu:\n' + (err.message || String(err))
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
