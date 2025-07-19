// Node & external dependencies
import subsetFont from "subset-font";
import { create, type Font } from "fontkit";

export async function buildFont(
	inputBuffer: Buffer,
	unicodes: Array<string>,
): Promise<Buffer | false> {
	const font = create(inputBuffer) as Font;
	const hasCharactersForRange = unicodes.some((char) => {
		const value = char.charCodeAt(0);
		return font.characterSet.includes(value);
	});
	if (!hasCharactersForRange) {
		return false;
	}

	const fontBuffer = await subsetFont(inputBuffer, unicodes.join(""), {
		targetFormat: "woff2",
	});

	return fontBuffer;
}
