import * as csstree from "css-tree";
import path from "node:path";
import { type FontAssetList } from "../types";

export function swapFontAssets(css: string, fontAssets: FontAssetList): string {
	const ast = csstree.parse(css);
	let currentFont: string | false = false;

	// traverse AST and modify it
	csstree.walk(ast, {
		visit: "Atrule",
		enter: (node) => {
			if (node.name === "font-face") {
				csstree.walk(node, {
					visit: "Declaration",
					enter: (decl) => {
						if (decl.property === "src") {
							csstree.walk(decl.value, {
								visit: "Url",
								enter: (urlNode) => {
									currentFont = path.basename(urlNode.value);
								},
							});
						}
					},
				});
			}
		},
		leave: (node, item, list) => {
			if (node.name === "font-face") {
				const replacement = fontAssets.find(({ source }) => currentFont === source);
				if (!replacement) {
					return;
				}

				replacement.subsets.forEach((subset) => {
					const newNode = csstree.clone(node) as csstree.Atrule;
					let hasUnicodeRange = false;
					csstree.walk(newNode, {
						visit: "Declaration",
						leave: (decl) => {
							// Update src and unicode-range in place.
							if ("src" === decl.property || "unicode-range" === decl.property) {
								const newValue = csstree.parse(subset.css[decl.property], {
									context: "value",
								}) as csstree.Value;
								decl.value = newValue;
							}
							if ("unicode-range" === decl.property) {
								hasUnicodeRange = true;
							}
						},
					});
					// There was no unicode-range, so add it.
					if (!hasUnicodeRange) {
						const newRule = csstree.parse(
							`unicode-range: ` + subset.css["unicode-range"],
							{
								context: "declaration",
							},
						) as csstree.Declaration;
						newNode.block!.children.appendData(newRule);
					}
					list.insertData(newNode, item);
				});

				list.remove(item);
			}
		},
	});

	return csstree.generate(ast);
}
