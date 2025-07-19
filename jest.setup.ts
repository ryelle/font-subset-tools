import { expect } from "@jest/globals";

expect.extend({
	toContainOnce(actual, expected) {
		if (typeof actual !== "string") {
			throw new Error("Actual value must be a string");
		}

		const escaped = expected.replace("+", "\\+");
		const re = new RegExp(`${escaped}[,;}]`, "g");
		const matches = [...actual.matchAll(re)];

		const pass = matches.length === 1;

		return {
			pass,
			message: pass
				? () => `expected ${actual} to not contain ${expected} only once.`
				: () => `expected ${actual} to contain ${expected} only once`,
		};
	},
});
