import path from "path";
import webpack from "webpack";
import { createFsFromVolume, Volume } from "memfs";

interface CompilerOptions {
	name?: string;
	[key: string]: unknown;
}

export default (
	fixture: string,
	options: CompilerOptions = {},
): Promise<webpack.Stats> => {
	const compiler = webpack({
		context: __dirname,
		entry: `./${fixture}`,
		output: {
			path: path.resolve(__dirname),
			filename: "bundle.js",
		},
		module: {
			rules: [
				{
					test: /\.(woff2?|ttf|eot|svg)$/,
					use: {
						loader: path.resolve(__dirname, "../dist/index.js"),
						options,
					},
				},
			],
		},
	});

	const outputFileSystem = createFsFromVolume(new Volume());
	compiler.outputFileSystem =
		outputFileSystem as webpack.Compiler["outputFileSystem"];
	(
		outputFileSystem as typeof outputFileSystem & { join: typeof path.join }
	).join = path.join.bind(path);

	return new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (err) reject(err);
			if (stats?.hasErrors()) reject(stats.toJson().errors);

			resolve(stats!);
		});
	});
};
