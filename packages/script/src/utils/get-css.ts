import { fontace } from "fontace";
import path from "node:path";
import { readFileSync } from "node:fs";

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

export function getCss(filePath: string, unicodes: Array<string>): string {
	const fontBuffer = readFileSync(filePath);
	const metadata = fontace(fontBuffer);

	let css = ["@font-face {"];
	css.push(`\tfont-family: "${metadata.family}";`);
	css.push(`\tfont-style: ${metadata.style};`);
	css.push(`\tfont-weight: ${metadata.weight};`);
	css.push("\tfont-display: swap;");
	css.push(`\tsrc: url("${path.basename(filePath)}") format("${metadata.format}");`);
	css.push(`\tunicode-range: ${metadata.unicodeRange};`);
	css.push(`\tunicode-range: ${getUnicodeRange(unicodes)};`);
	css.push("}");
	return css.join("\n");
}
