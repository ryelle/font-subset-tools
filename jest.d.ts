declare global {
	namespace jest {
		interface Expect {
			toContainOnce(expected: string): jest.Matchers<string>;
		}
		interface Matchers<R> {
			toContainOnce(expected: string): R;
		}
	}
}

export {};
