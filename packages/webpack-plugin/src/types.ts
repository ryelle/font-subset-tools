export type FontSubsetterPluginOptions = {
	test?: RegExp;
	subsets?: Array<string>;
};

export type FontAsset = {
	source: string;
	subsets: Array<{ file: string; css: string }>;
};

export type FontAssetList = Array<FontAsset>;
