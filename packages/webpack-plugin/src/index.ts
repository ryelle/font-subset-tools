import path from "node:path";
import { Compiler, Compilation } from "webpack";
import { Source, RawSource } from "webpack-sources";
import { FontSubsetterPluginOptions, FontAsset, FontAssetList } from "./types";
import { buildFont, getSubsets, getUnicodes, getCss, swapFontAssets } from "../../utils";

function getBufferFromAsset(asset: Source): Buffer {
	// asset.source() can return string or Buffer
	const source = asset.source();
	if (typeof source === "string") {
		return Buffer.from(source);
	} else {
		return source as Buffer;
	}
}

class FontSubsetPlugin {
	private options: FontSubsetterPluginOptions;
	private fontAssets: FontAssetList;

	constructor(options: FontSubsetterPluginOptions = {}) {
		this.options = options;
		this.fontAssets = [];
	}

	apply(compiler: Compiler) {
		// Tap into compilation hook which gives compilation as argument to the callback function
		compiler.hooks.compilation.tap("FontSubsetPluginFonts", (compilation: Compilation) => {
			// Now we can tap into various hooks available through compilation
			compilation.hooks.processAssets.tapPromise(
				{
					name: "FontSubsetPluginCompilation",
					stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
				},
				async (assets: Record<string, Source>) => {
					const fontTest = this.options.test || /\.(woff2?|ttf|otf|eot)$/i;
					const validSubsets = this.options.subsets || [];

					for (const fileName in assets) {
						if (!fontTest.test(fileName)) {
							continue;
						}
						const buffer: Buffer = getBufferFromAsset(assets[fileName]);
						const fontAsset: FontAsset = {
							source: fileName,
							subsets: [],
						};

						try {
							const subsets = await getSubsets();
							for (let i = 0; i < subsets.length; i++) {
								const subset = subsets[i];
								if (validSubsets.length && !validSubsets.includes(subset.name)) {
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
											? `${filePrefix}-${subset.name}.woff2`
											: `${filePrefix}-${subset.name}-${bin}.woff2`;

									const outputBuffer = await buildFont(buffer, slice);
									compilation.emitAsset(
										outputFilename,
										new RawSource(outputBuffer),
									);
									const css = getCss(outputBuffer, outputFilename, slice);
									fontAsset.subsets.push({ file: outputFilename, css: css });
								}
							}
						} catch (err) {
							compilation.errors.push(err as Error);
						}

						this.fontAssets.push(fontAsset);
					}
				},
			);
		});

		compiler.hooks.emit.tap("FontSubsetPluginCSS", (compilation: Compilation) => {
			Object.keys(compilation.assets).forEach((filename) => {
				if (filename.endsWith(".css")) {
					const asset = compilation.assets[filename];
					const css = asset.source().toString();
					try {
						const newCss = swapFontAssets(css, this.fontAssets);
						compilation.assets[filename] = new RawSource(newCss);
					} catch (err) {
						compilation.errors.push(err as Error);
					}
				}
			});
		});
	}
}

export default FontSubsetPlugin;
