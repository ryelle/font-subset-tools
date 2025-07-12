module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/packages"],
	testMatch: [
		"**/__tests__/**/*.ts",
		"**/?(*.)+(spec|test).ts",
		"**/?(*.)+(spec|test).js",
	],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: false,
			},
		],
	},
	collectCoverageFrom: [
		"packages/**/src/**/*.ts",
		"!packages/**/src/**/*.d.ts",
	],
	moduleFileExtensions: ["ts", "js", "json"],
};
