import { NextConfig } from "next";
import path from "node:path";

// type PluginOptions = Record<string, unknown>;

export default function withMyExtension(
	nextConfig: NextConfig = {},
	// options: PluginOptions = {},
) {
	return {
		...nextConfig,
		// @ts-expect-error - Undefined arguments.
		webpack(config, opts) {
			config.module.rules.push({
				test: /\.(woff2?|ttf|eot|svg)$/,
				use: {
					loader: path.resolve("./loader.js"),
				},
			});

			if (typeof nextConfig.webpack === "function") {
				return nextConfig.webpack(config, opts);
			}
			return config;
		},
		// You can add more custom logic here
	};
}
