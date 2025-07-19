import { NextConfig } from "next";
import FontSubsetPlugin from "@ryelle/font-subset-webpack-plugin";

// type PluginOptions = Record<string, unknown>;

export default function withMyExtension(
	nextConfig: NextConfig = {},
	// options: PluginOptions = {},
) {
	return {
		...nextConfig,
		// @ts-expect-error - Undefined arguments.
		webpack(config, opts) {
			config.plugins.push(new FontSubsetPlugin(opts));

			if (typeof nextConfig.webpack === "function") {
				return nextConfig.webpack(config, opts);
			}
			return config;
		},
		// You can add more custom logic here
	};
}
