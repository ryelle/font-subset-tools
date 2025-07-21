export type FontSubsetterPluginOptions = {
	test?: RegExp;
	subsets?: Array<string>;
};

export type FontSubsetterPluginOptionList = Array<FontSubsetterPluginOptions>;

export type CSSList = Record<string, string>;

export type FontAsset = {
	source: string;
	subsets: Array<{ file: string; css: CSSList }>;
};

export type FontAssetList = Array<FontAsset>;
