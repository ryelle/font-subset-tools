/**
 * @jest-environment node
 */
import { compiler, getAssetOutput } from "./compiler";
import subsetUtils from "../dist/utils";

jest.mock("../dist/utils", () => {
	return {
		...jest.requireActual("../dist/utils"),
		getSubsets: jest.fn(),
		getUnicodes: jest.fn(),
	};
});

describe("Loader", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		(subsetUtils.getSubsets as jest.Mock).mockImplementation(async () => [
			{ name: "latin", path: "./latin.nam" },
			{ name: "cyrillic", path: "./cyrillic.nam" },
			{ name: "korean", path: "./korean.txt" },
		]);
		(subsetUtils.getUnicodes as jest.Mock).mockImplementation(async ({ name }) => {
			switch (name) {
				case "cyrillic":
					return [["к", "о", "ш", "а"]];
				case "korean":
					return [
						["고", "양", "이"],
						["강", "아", "지"],
					];
				case "latin":
				default:
					return [["C", "A", "T"]];
			}
		});
	});

	test("Update CSS with subset fonts", async () => {
		const stats = await compiler("lat-cyr-example.js", {
			test: /\.(woff2?|ttf|otf|eot)$/i,
			subsets: ["latin", "cyrillic"],
		});
		const assets = stats?.compilation.getAssets() || [];

		// Have we subset into two fonts?
		const fontAssets = assets.filter((a) => a.name.endsWith(".woff2"));
		expect(fontAssets).toHaveLength(2);

		// Check the CSS for font name and unicode ranges.
		const output = getAssetOutput(stats, "main.css");
		expect(output).toContain("-latin.woff2");
		expect(output).toContainOnce("U+41");
		expect(output).toContainOnce("U+43");
		expect(output).toContainOnce("U+54");
		expect(output).toContain("-cyrillic.woff2");
		expect(output).toContainOnce("U+430");
		expect(output).toContainOnce("U+43A");
		expect(output).toContainOnce("U+43E");
		expect(output).toContainOnce("U+448");
	});

	test("Update CSS with subset-sliced fonts", async () => {
		const stats = await compiler("kr-example.js", {
			test: /\.(woff2?|ttf|otf|eot)$/i,
			subsets: ["korean"],
		});
		const assets = stats?.compilation.getAssets() || [];

		// Two subset slices
		const fontAssets = assets.filter((a) => a.name.endsWith(".woff2"));
		expect(fontAssets).toHaveLength(2);

		// Check the CSS for font name and unicode ranges.
		const output = getAssetOutput(stats, "main.css");
		expect(output).toContain("-korean-");
		expect(output).toContainOnce("U+ACE0");
		expect(output).toContainOnce("U+C591");
		expect(output).toContainOnce("U+C774");
		expect(output).toContainOnce("U+AC15");
		expect(output).toContainOnce("U+C544");
		expect(output).toContainOnce("U+C9C0");
	});

	test("Not update CSS if font doesn't support subset", async () => {
		const stats = await compiler("lat-cyr-example.js", {
			test: /\.(woff2?|ttf|otf|eot)$/i,
			subsets: ["korean"],
		});
		const assets = stats?.compilation.getAssets() || [];

		// No fonts.
		const fontAssets = assets.filter((a) => a.name.endsWith(".woff2"));
		expect(fontAssets).toHaveLength(0);

		// No change to the CSS.
		const output = getAssetOutput(stats, "main.css");
		expect(output).not.toContain("-korean-");
		expect(output).not.toContain("U+ACE0");
		expect(output).not.toContain("U+C591");
		expect(output).not.toContain("U+C774");
	});
});
