// Node & external dependencies
import subsetFont from "subset-font";

export async function buildFont(inputBuffer: Buffer, unicodes: Array<string>): Promise<Buffer> {
	return await subsetFont(inputBuffer, unicodes.join(""), {
		targetFormat: "woff2",
	});
}
