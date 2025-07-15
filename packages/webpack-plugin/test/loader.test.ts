/**
 * @jest-environment node
 */
import { compiler, getAssetOutput } from "./compiler";

describe("Loader", () => {
	test(
		"Process a font",
		async () => {
			const stats = await compiler("example.js", {
				test: /\.(woff2?|ttf|otf|eot)$/i,
				subsets: ["latin", "cyrillic"],
			});
			const assets = stats?.compilation.getAssets() || [];

			// Have we subset into two fonts?
			const fontAssets = assets.filter((a) => a.name.endsWith(".woff2"));
			expect(fontAssets).toHaveLength(2);
			// Check the CSS as well.
			const output = getAssetOutput(stats, "main.css");
			expect(output).toContain("unicode subsets");
		},
		// Increase timeout to account for subset syncing.
		30 * 1000,
	);
});
