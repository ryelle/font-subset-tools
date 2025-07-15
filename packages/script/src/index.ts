#!/usr/bin/env node
// Node & external dependencies
import path from "node:path";
// import { mkdir, stat, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";

// Internal dependencies
import { getSubsets } from "./utils/get-subsets";
import { getUnicodes } from "./utils/get-unicodes";
import { buildFont } from "./utils/build-font";
// import { getCss } from "./utils/get-css";

interface Options {
	validSubsets?: Array<string>;
	fileName: string;
	outputDir: string;
}

export default async function createSubsets(
	inputFont: Buffer,
	options: Options,
) {
	const { validSubsets = [], fileName, outputDir } = options;
	try {
		await mkdir(outputDir);
	} catch {
		// If mkdir failed, the directory already exists.
	}

	// let css = "";

	const subsets = await getSubsets();
	for (let i = 0; i < subsets.length; i++) {
		const subset = subsets[i];
		const subsetName = subset.name.replace(/\.(txt|nam)$/, "");
		if (validSubsets.length && !validSubsets.includes(subsetName)) {
			continue;
		}
		const unicodes = await getUnicodes(subset);
		if (!unicodes.length) {
			continue;
		}
		let bin;
		for (bin = 0; bin < unicodes.length; bin++) {
			const slice = unicodes[bin];
			const filePrefix = path.parse(fileName).name;
			const outputFilename =
				unicodes.length === 1
					? `${filePrefix}-${subsetName}.woff2`
					: `${filePrefix}-${subsetName}-${bin}.woff2`;
			const outputPath = path.resolve(outputDir, outputFilename);
			const outputFile = await buildFont(inputFont, outputPath, slice);

			console.log(outputFile);

			// css += `\n/* ${subsetName} [${bin}] */\n`;
			// css += getCss(outputFile, slice);
		}
	}

	// Write the CSS file.
	// const cssFileName = `${path.parse(inputFile).name}.css`;
	// await writeFile(path.resolve(outputDir, cssFileName), css);
}
