module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/packages"],
	testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts", "**/?(*.)+(spec|test).js"],
	transformIgnorePatterns: ["node_modules/(?!(fontace))"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: false,
			},
		],
		"^.+\\.jsx?$": "babel-jest",
	},
	collectCoverageFrom: ["packages/**/src/**/*.ts", "!packages/**/src/**/*.d.ts"],
	moduleFileExtensions: ["ts", "js", "json"],
	setupFilesAfterEnv: ["./jest.setup.ts"],
};
