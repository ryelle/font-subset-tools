/**
 * @jest-environment node
 */
import compiler from "./compiler";

describe("Loader", async () => {
	test("Process a font", async () => {
		const stats = await compiler("example-style.css", {
			subsets: ["latin", "cyrillic"],
		});
		const output = stats.toJson({ source: true }).modules?.[0]?.source;

		expect(output).toContain("unicode subsets");
	});
});
