import { fontace } from "fontace";
import path from "node:path";
import { type CSSList } from "../types";

export function getUnicodeRange(unicodes: Array<string>): string {
	unicodes.sort();
	let prevValue = unicodes[0].charCodeAt(0);
	const rangeList = [prevValue];
	for (let i = 1; i < unicodes.length; i++) {
		const char = unicodes[i];
		const value = char.charCodeAt(0);
		if (prevValue + 1 !== value) {
			rangeList.push(prevValue, value);
		}
		prevValue = value;
	}
	rangeList.push(prevValue);
	let rangeString = "";
	for (let i = 0; i < rangeList.length / 2; i++) {
		const start = rangeList[2 * i].toString(16).toUpperCase();
		const end = rangeList[2 * i + 1].toString(16).toUpperCase();
		if (start === end) {
			rangeString += `U+${start},`;
		} else {
			rangeString += `U+${start}-${end},`;
		}
	}
	return rangeString.replace(/,$/, "");
}

export function getCssData(fontBuffer: Buffer, filePath: string, unicodes: Array<string>): CSSList {
	const metadata = fontace(fontBuffer);

	const css = {
		src: `url("${path.basename(filePath)}") format("${metadata.format}")`,
		"unicode-range": `${getUnicodeRange(unicodes)}`,
	};

	return css;
}
