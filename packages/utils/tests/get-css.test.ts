import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fontace } from "fontace";
import { getCssFromFile, getUnicodeRange } from "../src/get-css";
import { readFileSync } from "node:fs";

jest.mock("node:fs", () => {
	return {
		readFileSync: jest.fn(),
	};
});

jest.mock("fontace", () => ({
	fontace: jest.fn(),
}));

const FONT = {
	family: "MockFont",
	format: "woff2",
	isVariable: true,
	style: "normal",
	weight: "300 800",
};

describe("getCssFromFile", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		(fontace as jest.Mock).mockImplementation(() => {
			return FONT;
		});
		(readFileSync as jest.Mock).mockImplementation(() => {
			return "";
		});
	});

	test("returns CSS and unicode for a variable font", () => {
		const css = getCssFromFile("./font.woff2", ["A", "B", "C"]);
		expect(css).toContain("@font-face");
		expect(css).toContain('font-family: "MockFont";');
		expect(css).toContain("font-style: normal;");
		expect(css).toContain("font-weight: 300 800;");
		expect(css).toContain("unicode-range: U+41-43;");
		expect(css).toContain('src: url("font.woff2") format("woff2");');
	});

	test("returns CSS and unicode for an italic font", () => {
		(fontace as jest.Mock).mockImplementation(() => {
			return {
				...FONT,
				style: "italic",
			};
		});
		const css = getCssFromFile("./font.woff2", ["A", "B", "C"]);
		expect(css).toContain("@font-face");
		expect(css).toContain('font-family: "MockFont";');
		expect(css).toContain("font-style: italic;");
		expect(css).toContain("font-weight: 300 800;");
		expect(css).toContain("unicode-range: U+41-43;");
		expect(css).toContain('src: url("font.woff2") format("woff2");');
	});

	test("returns CSS and unicode for a regular font", () => {
		(fontace as jest.Mock).mockImplementation(() => {
			return {
				...FONT,
				weight: "400",
			};
		});
		const css = getCssFromFile("./font.woff2", ["A", "B", "C"]);
		expect(css).toContain("@font-face");
		expect(css).toContain('font-family: "MockFont";');
		expect(css).toContain("font-style: normal;");
		expect(css).toContain("font-weight: 400;");
		expect(css).toContain("unicode-range: U+41-43;");
		expect(css).toContain('src: url("font.woff2") format("woff2");');
	});

	test("returns CSS with different unicode-range for different unicodes", () => {
		const css = getCssFromFile("./font.woff2", ["0", "1", "2"]);
		expect(css).toContain("unicode-range: U+30-32");
	});
});

describe("getUnicodeRange", () => {
	test("returns a collapsed range of sequential unicode values", () => {
		const result = getUnicodeRange(["0", "1", "2"]);
		expect(result).toBe("U+30-32");
	});

	test("returns two comma separated ranges when not sequential", () => {
		const result = getUnicodeRange(["0", "1", "2", "a", "b", "c"]);
		expect(result).toBe("U+30-32,U+61-63");
	});

	test("returns ranges in ascending order", () => {
		const result = getUnicodeRange(["0", "1", "2", "a", "b", "c", "A"]);
		expect(result).toBe("U+30-32,U+41,U+61-63");
	});
});
