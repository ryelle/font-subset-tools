import pc from "picocolors";

type LogLevel = "log" | "debug" | "warn" | "error";

function _output(level: LogLevel = "log", ...args: any[]) {
	if (level === "error") {
		console.error(...args);
	} else if (process.env.NODE_ENV !== "test") {
		console.log(...args);
	}
}

export function log(...args: any[]) {
	_output("log", ...args);
}

export function debug(...args: any[]) {
	if (process.argv.slice(2).includes("--verbose") || process.argv.slice(2).includes("-v")) {
		_output("debug", pc.red("DEBUG"), ...args);
	}
}

export function warn(...args: any[]) {
	_output("warn", ...args);
}

export function error(...args: any[]) {
	_output("error", ...args);
}
