import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export interface FileItem {
	name: string;
	path: string;
}

export interface ContentsApiResponse {
	name: string;
	path?: string;
	sha?: string;
	size?: number;
	url?: string;
	html_url?: string;
	git_url?: string;
	download_url: string;
	type: string;
}

export const CACHE_PATH = path.resolve(__dirname, "../../tmp");
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getSubsetLabel(fileName: string): string {
	let label = fileName.replace(/(.*)_.*(\.(?:txt|nam))$/, "$1$2");
	if (fileName.includes("-chinese")) {
		label = fileName.replace(/((.*)-(.*))_.*(\.(?:txt|nam))$/, "$3-$2$4");
	}
	return label.replace(/\.(txt|nam)$/, "");
}

async function getRemoteOrCachedFiles(
	url: string,
	cachePath: string = CACHE_PATH,
	revalidateCache: boolean = false,
): Promise<Array<FileItem>> {
	const subsets: Array<FileItem> = [];
	try {
		const files = await readdir(cachePath);
		// Check modified date of first file, since they all should have the same date.
		const { mtimeMs } = await stat(`${cachePath}/${files[0]}`);
		if (revalidateCache || mtimeMs < Date.now() - 7 * DAY_IN_MS) {
			// Error doesn't really matter, just needs to trigger into the catch.
			throw new Error("revalidate_cache");
		}
		for (const file of files) {
			const name = getSubsetLabel(file);
			const path = `${cachePath}/${file}`;
			subsets.push({ name, path });
		}
	} catch {
		try {
			await mkdir(cachePath, { recursive: true });
		} catch {
			// If mkdir failed, the directory already exists.
		}
		const response = await fetch(url);
		const fileList: Array<ContentsApiResponse> = await response.json();
		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i];
			if (file.type === "file" && file.download_url && /(txt|nam)$/.test(file.name)) {
				const name = getSubsetLabel(file.name);
				const path = `${cachePath}/${file.name}`;
				const fileResponse = await fetch(file.download_url);
				const body = await fileResponse.text();
				await writeFile(path, body);
				subsets.push({ name, path });
			}
		}
	}
	return subsets;
}

export async function getSubsets(revalidateCache: boolean = false): Promise<Array<FileItem>> {
	const subsets: Array<FileItem> = [];
	const _subsets = await getRemoteOrCachedFiles(
		"https://api.github.com/repos/googlefonts/nam-files/contents/Lib/gfsubsets/data",
		`${CACHE_PATH}/subsets`,
		revalidateCache,
	);
	subsets.push(..._subsets);
	const _slices = await getRemoteOrCachedFiles(
		"https://api.github.com/repos/googlefonts/nam-files/contents/slices",
		`${CACHE_PATH}/slices`,
		revalidateCache,
	);
	slices: for (let i = 0; i < _slices.length; i++) {
		const item = _slices[i];
		for (let j = 0; j < subsets.length; j++) {
			if (subsets[j].name === item.name) {
				subsets[j] = item;
				continue slices;
			}
		}
		// If we get here, the slice was not found.
		subsets.push(item);
	}

	return subsets;
}
