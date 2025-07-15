import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import lineByLine from "n-readlines";
import fs from "fs/promises";
import { MOCK_FILE_INFO } from "./__data__/files";
import { getUnicodes } from "../src/get-unicodes";
import { CACHE_PATH } from "../src/get-subsets";

jest.mock("n-readlines", () => jest.fn());
jest.mock("fs/promises", () => {
	return {
		open: jest.fn(),
	};
});

describe("getUnicodes", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		(lineByLine as jest.Mock).mockImplementation((...args: unknown[]) => {
			const filePath = args[0] as string;
			const fileContent = MOCK_FILE_INFO[filePath].split("\n");
			let index = 0;
			return {
				next: () => {
					const line = fileContent[index];
					index++;
					return index >= fileContent.length ? false : line;
				},
			};
		});
		(fs.open as jest.Mock).mockImplementation(async (...args: unknown[]): Promise<unknown> => {
			const filePath = args[0] as string;
			const fileContent = MOCK_FILE_INFO[filePath].split("\n");
			return Promise.resolve({
				readLines: () => fileContent,
			});
		});
	});

	test("It should parse the Latin subset", async () => {
		const result = await getUnicodes({
			name: "latin_unique-glyphs.nam",
			path: `${CACHE_PATH}/subsets/latin_unique-glyphs.nam`,
		});
		expect(result).toEqual([["C", "A", "T"]]);
	});

	test("It should parse the Cyrillic subset", async () => {
		const result = await getUnicodes({
			name: "cyrillic_unique-glyphs.nam",
			path: `${CACHE_PATH}/subsets/cyrillic_unique-glyphs.nam`,
		});
		expect(result).toEqual([["к", "о", "ш", "а"]]);
	});

	test("It should parse the Korean slices", async () => {
		const result = await getUnicodes({
			name: "korean_default.txt",
			path: `${CACHE_PATH}/slices/korean_default.txt`,
		});
		expect(result).toEqual([
			["고", "양", "이"],
			["강", "아", "지"],
		]);
	});

	test("It should parse the Japanese slices", async () => {
		const result = await getUnicodes({
			name: "japanese_default.txt",
			path: `${CACHE_PATH}/slices/japanese_default.txt`,
		});
		expect(result).toEqual([["ね", "こ"]]);
	});
});
