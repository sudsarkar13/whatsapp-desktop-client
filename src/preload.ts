import { clipboard, ipcRenderer, contextBridge } from "electron";

function overrideNotification() {
	window.Notification = class extends Notification {
		constructor(title: string, options?: NotificationOptions) {
			super(title, options || {});
			this.onclick = (_event) => ipcRenderer.send("notification-click");
		}
	};
}

function handleChromeVersionBug() {
	window.addEventListener("DOMContentLoaded", () => {
		if (
			document.getElementsByClassName("landing-title version-title").length != 0
		)
			ipcRenderer.send("chrome-version-bug");
	});
}

function setupChatFeatures() {
	// Add support for native context menu
	window.addEventListener("contextmenu", (e) => {
		const element = e.target as HTMLElement;
		if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
			const start = (element as HTMLInputElement).selectionStart;
			const end = (element as HTMLInputElement).selectionEnd;
			const selection = window.getSelection()?.toString();

			if (selection) {
				// Handle text selection
				ipcRenderer.send("show-context-menu", {
					isTextSelected: true,
					text: selection,
				});
			}
		}
	});

	// Handle copy/paste
	document.addEventListener("copy", (e) => {
		const selection = window.getSelection()?.toString();
		if (selection) {
			clipboard.writeText(selection);
		}
	});

	document.addEventListener("paste", (e) => {
		const element = e.target as HTMLElement;
		if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
			const text = clipboard.readText();
			const input = element as HTMLInputElement;
			const start = input.selectionStart || 0;
			const end = input.selectionEnd || 0;
			input.value = input.value.slice(0, start) + text + input.value.slice(end);
			input.selectionStart = input.selectionEnd = start + text.length;
		}
	});
}

function setupMediaHandlers() {
	// Handle video/voice call buttons
	document.addEventListener("DOMContentLoaded", () => {
		// Auto-accept media permission requests
		navigator.mediaDevices
			.getUserMedia({ audio: true, video: true })
			.then(() => console.log("Media permissions granted"))
			.catch((err) => console.error("Media permission error:", err));
	});

	// Handle fullscreen
	document.addEventListener("fullscreenchange", () => {
		if (document.fullscreenElement) {
			ipcRenderer.send("enter-full-screen");
		} else {
			ipcRenderer.send("exit-full-screen");
		}
	});
}

overrideNotification();
handleChromeVersionBug();
setupChatFeatures();
setupMediaHandlers();

// Expose necessary APIs to the renderer process
contextBridge.exposeInMainWorld("whatsapp", {
	copyToClipboard: (text: string) => clipboard.writeText(text),
	pasteFromClipboard: () => clipboard.readText(),
	requestFullscreen: () => document.documentElement.requestFullscreen(),
	exitFullscreen: () => document.exitFullscreen(),
});
