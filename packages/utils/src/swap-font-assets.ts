import * as csstree from "css-tree";
import path from "node:path";

type FontAssetSubset = { file: string; css: string; node?: csstree.CssNode };
type FontAsset = {
	source: string;
	subsets: Array<FontAssetSubset>;
};

type FontAssetList = Array<FontAsset>;

export function swapFontAssets(css: string, fontAssets: FontAssetList): string {
	const ast = csstree.parse(css);
	let currentFont: string | false = false;
	fontAssets.forEach(({ subsets }, i) => {
		subsets.forEach(({ css }, j) => {
			const node = csstree.parse(css);
			fontAssets[i].subsets[j].node = node;
		});
	});

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
					list.insertData(subset.node!, item);
				});

				list.remove(item);
			}
		},
	});

	return csstree.generate(ast);
}
