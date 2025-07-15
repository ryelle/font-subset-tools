import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import fs from "node:fs/promises";
import { getMockedFetchResponse, getMockedReaddirResponse } from "./__data__/files";
import { getSubsets } from "../get-subsets";

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
			name: "latin.nam",
			path: `${process.env.CACHE_DIR}/subsets/latin.nam`,
		});
		expect(result).toContainEqual({
			name: "korean.txt",
			path: `${process.env.CACHE_DIR}/slices/korean.txt`,
		});
		expect(result).toContainEqual({
			name: "chinese-traditional.txt",
			path: `${process.env.CACHE_DIR}/slices/chinese-traditional.txt`,
		});
		expect(result).not.toContainEqual({
			name: "chinese-traditional.nam",
			path: `${process.env.CACHE_DIR}/subsets/chinese-traditional.nam`,
		});
	});

	test("It should load the subsets from local files", async () => {
		(fs.readdir as jest.Mock).mockImplementation(async (...args: unknown[]): Promise<Array<string>> => {
			const dir = args[0] as string;
			return Promise.resolve(getMockedReaddirResponse(dir));
		});
		(fs.stat as jest.Mock).mockImplementation(async (): Promise<any> => {
			return Promise.resolve({ mtimeMs: Date.now() });
		});

		const result = await getSubsets();
		expect(result).toHaveLength(5);
		expect(result).toContainEqual({
			name: "latin.nam",
			path: `${process.env.CACHE_DIR}/subsets/latin.nam`,
		});
		expect(result).toContainEqual({
			name: "korean.txt",
			path: `${process.env.CACHE_DIR}/slices/korean.txt`,
		});
		expect(result).toContainEqual({
			name: "chinese-traditional.txt",
			path: `${process.env.CACHE_DIR}/slices/chinese-traditional.txt`,
		});
		expect(result).not.toContainEqual({
			name: "chinese-traditional.nam",
			path: `${process.env.CACHE_DIR}/subsets/chinese-traditional.nam`,
		});
	});
});
