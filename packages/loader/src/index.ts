import type { LoaderContext } from "webpack";
import createSubsets from "../../script";
import path from "node:path";

interface LoaderOptions {
	subsets?: Array<string>;
}

async function loader(
	this: LoaderContext<LoaderOptions>,
	source: Buffer,
): Promise<Buffer | string> {
	const options = this.getOptions();
	const fileName = path.basename(this.resourcePath);
	const outputDir = this._compiler?.options?.output?.path;
	if (!outputDir || !fileName) {
		return source;
	}

	try {
		await createSubsets(source, {
			validSubsets: options.subsets,
			fileName,
			outputDir,
		});
	} catch (error) {
		console.log(error);
	}

	return "";
}
loader.raw = true;

export = loader;
