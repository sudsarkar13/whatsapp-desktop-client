import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import path from "path";
import ChromeVersionFix from "./fix/chrome-version-fix";
import Electron21Fix from "./fix/electron-21-fix";
import HotkeyModule from "./module/hotkey-module";
import ModuleManager from "./module/module-manager";
import TrayModule from "./module/tray-module";
import WindowSettingsModule from "./module/window-settings-module";

const USER_AGENT =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.9999.0 Safari/537.36";

export default class WhatsApp {
	private readonly window: BrowserWindow;
	private readonly moduleManager: ModuleManager;
	public quitting = false;
	private isLoading = false;

	constructor() {
		this.window = new BrowserWindow({
			title: "WhatsApp",
			width: 1100,
			height: 700,
			minWidth: 650,
			minHeight: 550,
			show: false,
			webPreferences: {
				preload: path.join(__dirname, "preload.js"),
				nodeIntegration: true,
				contextIsolation: false,
				sandbox: true,
			},
		});

		this.moduleManager = new ModuleManager([
			new Electron21Fix(),
			new HotkeyModule(this, this.window),
			new TrayModule(this, this.window),
			new WindowSettingsModule(this, this.window),
			new ChromeVersionFix(this),
		]);

		this.setupEventListeners();
	}

	private setupEventListeners() {
		// Listen for successful load
		ipcMain.on("whatsapp-loaded", () => {
			this.isLoading = false;
			if (!this.window.isVisible()) {
				this.window.show();
			}
		});

		// Listen for loading errors
		ipcMain.on("loading-error", (_event, errorMessage) => {
			console.error("Loading error:", errorMessage);
			if (!this.isLoading) {
				this.showErrorDialog(errorMessage);
			}
		});

		// Handle window state
		this.window.on("close", (event) => {
			if (!this.quitting) {
				event.preventDefault();
				this.window.hide();
			}
		});

		// Handle load failures
		this.window.webContents.on(
			"did-fail-load",
			(_event, errorCode, errorDescription) => {
				if (errorCode !== -3 && !this.isLoading) {
					console.log(`Failed to load: ${errorDescription} (${errorCode})`);
					this.showErrorDialog(errorDescription);
				}
			}
		);
	}

	private showErrorDialog(error: string) {
		dialog
			.showMessageBox(this.window, {
				type: "error",
				title: "Connection Error",
				message: "Failed to load WhatsApp",
				detail: `Error: ${error}\nPlease check your internet connection and try again.`,
				buttons: ["Retry", "Quit"],
				defaultId: 0,
			})
			.then(({ response }) => {
				if (response === 0) {
					this.reload();
				} else {
					this.quit();
				}
			});
	}

	public init() {
		this.makeLinksOpenInBrowser();
		this.moduleManager.beforeLoad();
		this.window.setMenu(null);
		this.loadWhatsApp();
		this.moduleManager.onLoad();
	}

	private loadWhatsApp() {
		this.isLoading = true;
		this.window
			.loadURL("https://web.whatsapp.com/", {
				userAgent: USER_AGENT,
			})
			.catch((error) => {
				if (error.code !== "ERR_ABORTED") {
					this.showErrorDialog(error.message);
				}
			});
	}

	public reload() {
		if (!this.isLoading) {
			this.loadWhatsApp();
		}
	}

	public quit() {
		this.quitting = true;
		this.moduleManager.onQuit();
		app.quit();
	}

	private makeLinksOpenInBrowser() {
		this.window.webContents.setWindowOpenHandler((details) => {
			if (details.url !== this.window.webContents.getURL()) {
				shell.openExternal(details.url);
				return { action: "deny" };
			}
			return { action: "allow" };
		});
	}
}
