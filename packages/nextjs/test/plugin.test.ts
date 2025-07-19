import withFontSubset from "../src/index";

describe("withFontSubset", () => {
	test("should return a Next.js config with webpack modifications", () => {
		const config = withFontSubset();

		expect(config).toBeDefined();
		expect(typeof config.webpack).toBe("function");
	});

	test("should preserve existing Next.js config", () => {
		const existingConfig = {
			env: {
				CUSTOM_VAR: "test",
			},
		};

		const config = withFontSubset(existingConfig);

		expect(config.env).toEqual(existingConfig.env);
		expect(typeof config.webpack).toBe("function");
	});
});
