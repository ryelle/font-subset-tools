const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	setupFilesAfterEnv: ["./setup-jest.ts"],
	testPathIgnorePatterns: ["/node_modules/", "/__data__/", "<rootDir>/bin/"],
	testEnvironment: "node",
	transformIgnorePatterns: ["node_modules/(?!((@)?fontace)/)"],
	transform: {
		...tsJestTransformCfg,
		"^.+\\.jsx?$": "babel-jest",
	},
};
