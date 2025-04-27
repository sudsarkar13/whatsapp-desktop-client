import { app, nativeImage } from "electron";
import fs from "fs";
import path from "path";

export function findIcon(name: string) {
	let iconPath = fromDataDirs("icons/hicolor/512x512/apps/" + name);

	if (iconPath === null)
		iconPath = path.join("./data/icons/hicolor/512x512/apps/", name);

	return nativeImage.createFromPath(iconPath);
}

export function getUnreadMessages(title: string) {
	const matches = title.match(/\(\d+\) WhatsApp/);
	const numberMatch = matches?.[0]?.match(/\d+/);
	return numberMatch ? Number.parseInt(numberMatch[0]) : 0;
}

function fromDataDirs(iconPath: string) {
	const dataDirs = process.env.XDG_DATA_DIRS || "/usr/local/share:/usr/share";
	for (const dataDir of dataDirs.split(":")) {
		const fullPath = path.join(dataDir, iconPath);
		if (fs.existsSync(fullPath)) return fullPath;
	}
	return null;
}
