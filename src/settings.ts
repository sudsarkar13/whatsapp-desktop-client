type ElectronStoreType = any; // Temporary type until module is loaded
let StoreConstructor: ElectronStoreType | null = null;

export default class Settings {
	private store: ElectronStoreType | null = null;
	private readonly section: string;

	constructor(section: string) {
		this.section = section + ".";
	}

	private async ensureStore() {
		if (!StoreConstructor) {
			const module = await import("electron-store");
			StoreConstructor = module.default;
		}
		if (!this.store) {
			this.store = new StoreConstructor();
		}
		return this.store;
	}

	public async get<T>(key: string, defaults: T): Promise<T> {
		const store = await this.ensureStore();
		const value = store.get(this.section + key);
		return (value === undefined ? defaults : value) as T;
	}

	public async set<T>(key: string, value: T): Promise<void> {
		const store = await this.ensureStore();
		store.set(this.section + key, value);
	}
}
