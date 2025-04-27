import { ipcRenderer } from "electron";

// Override notifications to work with system tray
function overrideNotification() {
	window.Notification = class extends Notification {
		constructor(title: string, options?: NotificationOptions) {
			super(title, options || {});
			this.onclick = (_event) => ipcRenderer.send("notification-click");
		}
	};
}

// Monitor WhatsApp loading state
function monitorWhatsAppLoad() {
	let hasNotifiedLoad = false;

	const checkLoaded = () => {
		const app =
			document.querySelector('[data-testid="app"]') ||
			document.querySelector(".app") ||
			document.getElementById("app");

		if (app && !hasNotifiedLoad) {
			hasNotifiedLoad = true;
			ipcRenderer.send("whatsapp-loaded");
			console.log("WhatsApp Web loaded successfully");
			return true;
		}
		return false;
	};

	// Initial check
	if (!checkLoaded()) {
		// Set up mutation observer to watch for app element
		const observer = new MutationObserver(() => {
			if (checkLoaded()) {
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}
}

// Initialize features
overrideNotification();
monitorWhatsAppLoad();

// Handle loading errors
window.addEventListener("error", (event) => {
	if (
		event.message.includes("net::") ||
		event.message.includes("Failed to fetch")
	) {
		ipcRenderer.send("loading-error", event.message);
	}
});
