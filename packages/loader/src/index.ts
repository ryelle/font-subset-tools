import type { LoaderContext } from "webpack";

interface LoaderOptions {
	name?: string;
}

export default function (
	this: LoaderContext<LoaderOptions>,
	source: string,
): string {
	const options = this.getOptions();
	const name = options.name || "World";

	// Replace [name] placeholder with the actual name
	const processed = source.replace(/\[name\]/g, name);

	return `export default ${JSON.stringify(processed)};`;
}
