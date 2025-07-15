// Node & external dependencies
import subsetFont from "subset-font";
import { writeFile } from "node:fs/promises";

export async function buildFont(
	inputBuffer: Buffer,
	outputFile: string,
	unicodes: Array<string>,
): Promise<string> {
	const outputBuffer = await subsetFont(inputBuffer, unicodes.join(""), {
		targetFormat: "woff2",
	});
	await writeFile(outputFile, outputBuffer);
	return outputFile;
}
