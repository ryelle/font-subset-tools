import { debug } from "./log";

export function humanSize(value: number): string {
	if (value > 1024 * 1024 * 1024) {
		return `${Math.round((value / (1024 * 1024 * 1024)) * 100) / 100} GB`;
	} else if (value > 1024 * 1024) {
		return `${Math.round((value / (1024 * 1024)) * 100) / 100} MB`;
	} else {
		return `${Math.round((value / 1024) * 100) / 100} KB`;
	}
}

export function runPerf() {
	const memoryData = process.memoryUsage();
	const memoryUsage = {
		rss: `${humanSize(memoryData.rss)} -> Resident Set Size (memory allocated)`,
		heapTotal: `${humanSize(memoryData.heapTotal)} -> total size of the allocated heap`,
		heapUsed: `${humanSize(memoryData.heapUsed)} -> actual memory used during the execution`,
		external: `${humanSize(memoryData.external)} -> V8 external memory`,
	};

	debug(memoryUsage);
}
