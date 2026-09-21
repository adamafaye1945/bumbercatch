import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, type ChildProcess } from "child_process";
import * as fs from "fs";
import { checkDatabaseConnection } from "./db";
import { runMigrations } from "./migrate";
import { createServer } from "./server";
import { syncICloudEmails } from "./icloud/sync";
import { runNotificationRules } from "./notifications/rules";
import { syncWeather } from "./services/weather.service";
import { syncR6Stats } from "./services/r6.service";

const API_PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const R6_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

let voiceProcess: ChildProcess | null = null;

function startVoiceDaemon(): void {
  const voiceDir = path.join(__dirname, "../python/voice");
  const pythonBin = path.join(voiceDir, "venv", "bin", "python3");

  if (!fs.existsSync(pythonBin)) {
    console.warn(`[voice] Skipping voice daemon -- no venv at ${pythonBin}. See backend/python/voice/requirements.txt.`);
    return;
  }

  voiceProcess = spawn(pythonBin, ["daemon.py"], { cwd: voiceDir, stdio: "inherit" });
  voiceProcess.on("exit", (code) => {
    console.warn(`[voice] Daemon exited with code ${code}`);
    voiceProcess = null;
  });
  voiceProcess.on("error", (err) => {
    console.warn("[voice] Failed to start daemon:", err.message);
    voiceProcess = null;
  });
}

function runGarminSync(): Promise<void> {
  return new Promise((resolve) => {
    const pythonDir = path.join(__dirname, "../python");
    const pythonBin = path.join(pythonDir, "venv", "bin", "python3");

    if (!fs.existsSync(pythonBin)) {
      console.warn(`[garmin] Skipping sync -- no venv at ${pythonBin}. See backend/python/requirements.txt.`);
      resolve();
      return;
    }

    const proc = spawn(pythonBin, ["garmin_sync.py"], { cwd: pythonDir, stdio: "inherit" });
    proc.on("exit", (code) => {
      if (code !== 0) console.warn(`[garmin] Sync exited with code ${code}`);
      resolve();
    });
    proc.on("error", (err) => {
      console.warn("[garmin] Failed to start sync:", err.message);
      resolve();
    });
  });
}

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

  win.loadFile(path.join(__dirname, "../../frontend/dist/index.html"));
}

async function refreshAndNotify(): Promise<void> {
  await runGarminSync();

  try {
    const { synced, newMessages } = await syncICloudEmails();
    await runNotificationRules(newMessages);
    console.log(`[icloud] Sync complete (${synced} message(s), ${newMessages.length} new)`);
  } catch (err) {
    console.warn("[icloud] Sync/notify skipped:", err instanceof Error ? err.message : err);
  }

  try {
    await syncWeather();
  } catch (err) {
    console.warn("[weather] Sync skipped:", err instanceof Error ? err.message : err);
  }
}

async function refreshR6(): Promise<void> {
  try {
    await syncR6Stats();
  } catch (err) {
    console.warn("[r6] Sync skipped:", err instanceof Error ? err.message : err);
  }
}

app.whenReady().then(() => {
  createWindow();

  checkDatabaseConnection()
    .then(async () => {
      console.log("[db] Postgres connection OK");
      await runMigrations();
      console.log("[db] Schema migrations applied");

      await refreshAndNotify();
      await refreshR6();

      createServer().listen(API_PORT, () => {
        console.log(`[api] Listening on http://localhost:${API_PORT}`);
      });

      setInterval(refreshAndNotify, REFRESH_INTERVAL_MS);
      // R6's free tier is 2,000 calls/month and needs 2 calls per tracked
      // player per sync -- a daily interval keeps well under budget even
      // with a couple dozen players; the 15-min loop above would not.
      setInterval(refreshR6, R6_REFRESH_INTERVAL_MS);

      startVoiceDaemon();
    })
    .catch((err) => console.error("[db] Postgres initialization FAILED:", err));

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

app.on("before-quit", () => {
  voiceProcess?.kill();
});

ipcMain.on("app-quit", () => {
  app.quit();
});
