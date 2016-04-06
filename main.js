/* eslint strict: 0 */
'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const electron = require('electron');
const app = electron.app;

electron.crashReporter.start();

let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new electron.BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  });

  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
  mainWindow.maximize();
  mainWindow.setMenu(null);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
  }
});
