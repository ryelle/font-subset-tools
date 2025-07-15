import { open } from "node:fs/promises";
import lineByLine from "n-readlines";

interface FileItem {
	name: string;
	path: string;
}

export async function getUnicodes(subset: FileItem): Promise<Array<Array<string>>> {
	const unicodes = [];
	if (subset.path.includes("/slices/")) {
		const lines = new lineByLine(subset.path);
		let prevLine = "";
		let _line = lines.next();
		while (_line !== false) {
			const line = _line.toString();
			if (!/^#/.test(line)) {
				if (/subsets {/.test(line)) {
					const _unicodes = [];
					_line = lines.next();
					while (_line !== false) {
						const line = _line.toString();
						if (/}/.test(line)) {
							unicodes.push(_unicodes);
							break;
						}
						const match = /^\s+codepoints: ([0-9]{1,7}) .*$/.exec(line);
						if (match !== null) {
							const value = parseInt(match[1], 10);
							_unicodes.push(String.fromCodePoint(value));
						}
						_line = lines.next();
					}
				}
			}

			prevLine = line;
			_line = lines.next();
		}
	} else {
		const file = await open(subset.path);
		const _unicodes = [];
		for await (const line of file.readLines()) {
			const match = /^0x([0-9A-Fa-f]{1,6}) .*$/.exec(line);
			if (match !== null) {
				const value = parseInt(match[1], 16);
				_unicodes.push(String.fromCodePoint(value));
			}
		}
		unicodes.push(_unicodes);
	}
	return unicodes;
}
