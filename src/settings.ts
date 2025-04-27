import Store from "electron-store";

export default class Settings {
	private readonly store: Store<Record<string, any>>;
	private readonly section: string;

	constructor(section: string) {
		this.store = new Store<Record<string, any>>();
		this.section = section + ".";
	}

	public get<T>(key: string, defaults: T | null = null): T {
		return this.store.get(this.section + key, defaults as T);
	}

	public set<T>(key: string, value: T): void {
		this.store.set(this.section + key, value);
	}
}
