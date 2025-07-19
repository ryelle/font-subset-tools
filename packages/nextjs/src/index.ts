import { NextConfig } from "next";
import FontSubsetPlugin, {
	type FontSubsetterPluginOptions,
} from "@ryelle/font-subset-webpack-plugin";

export default function withFontSubset(
	nextConfig: NextConfig = {},
	options: FontSubsetterPluginOptions = {},
) {
	return {
		...nextConfig,
		// @ts-expect-error - Undefined arguments.
		webpack(config, opts) {
			config.plugins.push(new FontSubsetPlugin(options));

			if (typeof nextConfig.webpack === "function") {
				return nextConfig.webpack(config, opts);
			}
			return config;
		},
	};
}
