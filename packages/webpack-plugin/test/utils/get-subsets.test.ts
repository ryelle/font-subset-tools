import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import fs from "node:fs/promises";
import { getMockedFetchResponse, getMockedReaddirResponse } from "./__data__/files";
import { CACHE_PATH, getSubsets } from "../../src/utils/get-subsets";

jest.mock("node:fs/promises", () => {
	return {
		mkdir: jest.fn(),
		readdir: jest.fn(),
		stat: jest.fn(),
		writeFile: jest.fn(),
	};
});

describe("getSubsets", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	test("It should load the subsets from remote files", async () => {
		(fs.readdir as jest.Mock).mockImplementation(async (): Promise<Array<string>> => {
			throw new Error();
		});
		(global.fetch as jest.Mock) = jest.fn((...args: unknown[]) => {
			const url = args[0] as string;
			return Promise.resolve({
				json: () => Promise.resolve(getMockedFetchResponse(url)),
				text: () => Promise.resolve(""),
			});
		});

		const result = await getSubsets();
		expect(result).toHaveLength(5);
		expect(result).toContainEqual({
			name: "latin",
			path: `${CACHE_PATH}/subsets/latin_unique-glyphs.nam`,
		});
		expect(result).toContainEqual({
			name: "korean",
			path: `${CACHE_PATH}/slices/korean_default.txt`,
		});
		expect(result).toContainEqual({
			name: "chinese-traditional",
			path: `${CACHE_PATH}/slices/traditional-chinese_default.txt`,
		});
		expect(result).not.toContainEqual({
			name: "chinese-traditional",
			path: `${CACHE_PATH}/subsets/chinese-traditional.nam`,
		});
	});

	test("It should load the subsets from local files", async () => {
		(fs.readdir as jest.Mock).mockImplementation(
			async (...args: unknown[]): Promise<Array<string>> => {
				const dir = args[0] as string;
				return Promise.resolve(getMockedReaddirResponse(dir));
			},
		);
		(fs.stat as jest.Mock).mockImplementation(async (): Promise<{ mtimeMs: number }> => {
			return Promise.resolve({ mtimeMs: Date.now() });
		});

		const result = await getSubsets();
		expect(result).toHaveLength(5);
		expect(result).toContainEqual({
			name: "latin",
			path: `${CACHE_PATH}/subsets/latin_unique-glyphs.nam`,
		});
		expect(result).toContainEqual({
			name: "korean",
			path: `${CACHE_PATH}/slices/korean_default.txt`,
		});
		expect(result).toContainEqual({
			name: "chinese-traditional",
			path: `${CACHE_PATH}/slices/traditional-chinese_default.txt`,
		});
		expect(result).not.toContainEqual({
			name: "chinese-traditional",
			path: `${CACHE_PATH}/subsets/chinese-traditional.nam`,
		});
	});
});
