import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 420,
    height: 800,
    show: false,
    kiosk: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.show();

  win.loadFile(path.join(__dirname, "renderer/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("app-quit", () => {
  app.quit();
});
