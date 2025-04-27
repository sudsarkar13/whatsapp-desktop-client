import Store from "electron-store";

export default class Settings {
	private readonly store: Store;
	private readonly section: string;

	constructor(section: string) {
		this.store = new Store();
		this.section = section + ".";
	}

	public get<T>(key: string, defaults: T | null = null): T {
		return this.store.get(this.section + key) ?? defaults;
	}

	public set<T>(key: string, value: T): void {
		this.store.set(this.section + key, value);
	}
}
