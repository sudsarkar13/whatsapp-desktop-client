import { BrowserWindow } from "electron";
import Settings from "../settings";
import WhatsApp from "../whatsapp";
import Module from "./module";

const settings = new Settings("window");

export default class WindowSettingsModule extends Module {
	constructor(
		private readonly whatsApp: WhatsApp,
		private readonly window: BrowserWindow
	) {
		super();
	}

	public override async beforeLoad() {
		const defaults = this.window.getBounds();
		const bounds = await settings.get("bounds", defaults);
		this.window.setBounds(bounds);

		const isMaximized = await settings.get("maximized", false);
		if (isMaximized) {
			this.window.maximize();
		}
	}

	public override async onQuit() {
		await settings.set("maximized", this.window.isMaximized());

		if (!this.window.isMaximized()) {
			await settings.set("bounds", this.window.getBounds());
		}
	}
}
