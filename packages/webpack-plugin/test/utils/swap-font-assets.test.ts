import { swapFontAssets } from "../../src/utils/swap-font-assets";

describe("swapFontAssets", () => {
	test("It should add the subset font-face rules, replacing src and adding unicode range", () => {
		const css = `
@font-face {
	font-family: "Noto Sans";
	src: url(./noto-font.ttf) format("truetype");
	font-weight: 100 900;
	font-stretch: 100%;
	font-display: swap;
}

body {
	font-family: "Noto Sans", sans-serif;
}
`;

		const fontAssets = [
			{
				source: "noto-font.ttf",
				subsets: [
					{
						file: "noto-font-cyrillic.woff2",
						css: {
							src: 'url("noto-font-cyrillic.woff2") format("woff2")',
							"unicode-range":
								"U+0,U+D,U+20,U+A0,U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116",
						},
					},
					{
						file: "noto-font-latin.woff2",
						css: {
							src: 'url("noto-font-latin.woff2") format("woff2")',
							"unicode-range":
								"U+0,U+D,U+20-7E,U+A0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+300-301,U+303-304,U+308-309,U+323,U+329,U+2002,U+2009,U+200B,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
						},
					},
				],
			},
		];
		const result = swapFontAssets(css, fontAssets);
		expect(result).toContain("noto-font-latin.woff2");
		expect(result).toContainOnce("U+20-7E");
		expect(result).toContain("noto-font-cyrillic.woff2");
		expect(result).toContainOnce("U+301");
		expect(result).not.toContain("noto-font.ttf");
	});

	test("It should add the subset font-face rules, replacing both src and unicode range", () => {
		const css = `
@font-face {
	font-family: "Noto Sans";
	src: url(./noto-font.ttf) format("truetype");
	unicode-range: U+20-7E,U+A0-FF,U+131,U+152-153;
	font-weight: 100 900;
	font-stretch: 100%;
	font-display: swap;
}

body {
	font-family: "Noto Sans", sans-serif;
}
`;

		const fontAssets = [
			{
				source: "noto-font.ttf",
				subsets: [
					{
						file: "noto-font-cyrillic.woff2",
						css: {
							src: 'url("noto-font-cyrillic.woff2") format("woff2")',
							"unicode-range":
								"U+0,U+D,U+20,U+A0,U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116",
						},
					},
					{
						file: "noto-font-latin.woff2",
						css: {
							src: 'url("noto-font-latin.woff2") format("woff2")',
							"unicode-range":
								"U+0,U+D,U+20-7E,U+A0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+300-301,U+303-304,U+308-309,U+323,U+329,U+2002,U+2009,U+200B,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
						},
					},
				],
			},
		];
		const result = swapFontAssets(css, fontAssets);
		expect(result).toContain("noto-font-latin.woff2");
		expect(result).toContainOnce("U+20-7E");
		expect(result).toContain("noto-font-cyrillic.woff2");
		expect(result).toContainOnce("U+301");
		expect(result).not.toContain("noto-font.ttf");
	});
});
