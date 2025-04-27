import { BrowserWindow, Event, Input } from "electron";
import WhatsApp from "../whatsapp";
import Module from "./module";

interface ClickAction {
	control?: boolean;
	shift?: boolean;
	keys: Array<string>;
	action: () => void;
}

export default class HotkeyModule extends Module {
	private readonly actions = new Array<ClickAction>();

	constructor(
		private readonly whatsApp: WhatsApp,
		private readonly window: BrowserWindow
	) {
		super();
	}

	public override beforeLoad() {
		this.registerHotkeys();
		this.registerListeners();
	}

	public add(...clickActions: Array<ClickAction>) {
		clickActions.forEach((action) => this.actions.push(action));
	}

	private onInput(event: Event, input: Input) {
		this.actions.forEach((clickAction) => {
			if (
				input.control === clickAction.control &&
				input.shift === clickAction.shift &&
				clickAction.keys.includes(input.key.toUpperCase())
			) {
				clickAction.action();
				event.preventDefault();
			}
		});
	}

	private registerHotkeys() {
		this.add(
			{
				control: true,
				keys: ["+"],
				action: () => {
					if (this.window.webContents.getZoomFactor() < 3)
						this.window.webContents.zoomLevel += 1;
				},
			},
			{
				control: true,
				keys: ["0"],
				action: () => this.window.webContents.setZoomLevel(0),
			},
			{
				control: true,
				keys: ["-"],
				action: () => {
					if (this.window.webContents.getZoomFactor() > 0.5)
						this.window.webContents.zoomLevel -= 1;
				},
			},
			{
				keys: ["F5"],
				action: () => this.whatsApp.reload(),
			},
			{
				control: true,
				keys: ["R"],
				action: () => this.whatsApp.reload(),
			},
			{
				control: true,
				keys: ["W"],
				action: () => this.window.hide(),
			},
			{
				control: true,
				keys: ["Q"],
				action: () => this.whatsApp.quit(),
			},
			{
				control: true,
				keys: ["F"],
				action: () => this.window.setFullScreen(!this.window.isFullScreen()),
			},
			{
				control: true,
				keys: ["C"],
				action: async () => {
					const selection = await this.window.webContents.executeJavaScript(
						"window.getSelection().toString()"
					);
					if (selection && selection.length > 0) {
						this.window.webContents.copy();
					}
				},
			},
			{
				control: true,
				keys: ["V"],
				action: () => this.window.webContents.paste(),
			},
			{
				control: true,
				keys: ["A"],
				action: () => this.window.webContents.selectAll(),
			},
			{
				control: true,
				shift: true,
				keys: ["M"],
				action: () =>
					this.window.webContents.executeJavaScript(
						`document.querySelector('[aria-label="Mute"]')?.click()`
					),
			},
			{
				control: true,
				shift: true,
				keys: ["V"],
				action: () =>
					this.window.webContents.executeJavaScript(
						`document.querySelector('[aria-label="Video call"]')?.click()`
					),
			},
			{
				control: true,
				shift: true,
				keys: ["A"],
				action: () =>
					this.window.webContents.executeJavaScript(
						`document.querySelector('[aria-label="Voice call"]')?.click()`
					),
			}
		);
	}

	private registerListeners() {
		this.window.webContents.on("before-input-event", (event, input) =>
			this.onInput(event, input)
		);
	}
}
