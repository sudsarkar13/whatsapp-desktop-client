import { app } from "electron";
import WhatsApp from "./whatsapp";

let mainWindow: WhatsApp | null = null;

// Configure app before initialization
if (process.platform === "linux") {
	app.disableHardwareAcceleration();
}

// Set essential Chromium flags
app.commandLine.appendSwitch("disable-http-cache");
app.commandLine.appendSwitch("ignore-certificate-errors");
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
app.commandLine.appendSwitch("disable-site-isolation-trials");

// Quit when all windows are closed
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Handle app activation
app.on("activate", () => {
	if (!mainWindow) {
		mainWindow = new WhatsApp();
		mainWindow.init();
	}
});

// Check for single instance
if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit();
}

// Initialize app when ready
app.whenReady().then(() => {
	mainWindow = new WhatsApp();
	mainWindow.init();
});
