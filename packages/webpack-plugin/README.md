### Webpack Font Subset Plugin

A webpack plugin to create subset `woff2` versions of a font.

```ts
import path from "path";
import webpack from "webpack";
import FontSubsetPlugin, {
	type FontSubsetterPluginOptions,
} from "@ryelle/font-subset-webpack-plugin";

const fontOptions: FontSubsetterPluginOptions = [
	{
		test: /NotoSerifKR\.ttf$/i,
		subsets: ["korean"],
	},
	{
		test: /NotoSerif\.ttf$/i,
		subsets: ["latin","latin-ext","cyrillic","cyrillic-ext","greek","greek-ext","vietnamese"],
	},
];

const config: webpack.Configuration = {
	context: __dirname,
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "foo.bundle.js",
	},
	plugins: [new FontSubsetPlugin(fontOptions)],
	module: {
		rules: [
			{
				test: /\.(woff2?|ttf|otf|eot|svg)$/i,
				type: "asset/resource",
				generator: {
					filename: "[name][ext]",
				},
			},
		],
	},
};
```
