/**
 * @jest-environment node
 */
import { compiler, getAssetOutput } from "./compiler";

describe("Loader", () => {
	test("Process a font", async () => {
		const stats = await compiler("example.js", {
			subsets: ["latin", "cyrillic"],
		});
		const assets = stats?.compilation.getAssets() || [];
		// Have we subset into two fonts?
		// really, this should use "woff2" since the subsetter converts too.
		const fontAssets = assets.filter((a) => a.name.endsWith(".ttf"));
		expect(fontAssets).toHaveLength(2);
		// Check the CSS as well.
		const output = getAssetOutput(stats, "main.css");
		expect(output).toContain("unicode subsets");
	});
});
