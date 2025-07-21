import path from "path";
import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import FontSubsetPlugin from "../dist";
import { FontSubsetterPluginOptionList, FontSubsetterPluginOptions } from "../dist/types";

const outputFileSystem = createFsFromVolume(new Volume());

export function compiler(
	fixture: string,
	options: FontSubsetterPluginOptionList | FontSubsetterPluginOptions = {},
): Promise<webpack.Stats> {
	const compiler = webpack({
		context: __dirname,
		entry: `./__data__/${fixture}`,
		output: {
			path: path.resolve(__dirname),
			filename: "bundle.js",
		},
		plugins: [new MiniCssExtractPlugin(), new FontSubsetPlugin(options)],
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
				{
					test: /\.(woff2?|ttf|otf|eot|svg)$/i,
					type: "asset/resource",
					generator: {
						filename: "[name][ext]",
					},
				},
			],
		},
	});

	compiler.outputFileSystem = outputFileSystem as webpack.Compiler["outputFileSystem"];
	(outputFileSystem as typeof outputFileSystem & { join: typeof path.join }).join =
		path.join.bind(path);

	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err) reject(err);
			if (stats?.hasErrors()) reject(stats.toJson().errors);

			resolve(stats!);
		});
	});
}

export function getAssetOutput(stats: webpack.Stats, filename: string): string {
	const assets = stats?.compilation.getAssets() || [];

	const asset = assets.find((a) => a.name === filename);
	if (!asset) {
		return "";
	}
	const output = outputFileSystem?.readFileSync(path.resolve(__dirname, asset.name));
	return output.toString();
}
