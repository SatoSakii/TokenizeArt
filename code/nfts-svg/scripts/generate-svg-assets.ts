// scripts/generate-svg-assets.ts
import fs from "fs";
import path from "path";

const svgDir = path.join(__dirname, "../");

function loadAndMinify(filename: string): string {
    const raw = fs.readFileSync(path.join(svgDir, filename), "utf-8");

	return raw.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

const lgbt = loadAndMinify("42-nft-lgbt.svg");
const matrix = loadAndMinify("42-nft-matrix.svg");
const gold = loadAndMinify("42-nft-gold.svg");

const solContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// Fichier généré automatiquement depuis nfts-svg/ par scripts/generate-svg-assets.ts
// Ne pas éditer directement - relancer le script après modification d'un SVG source.
library SvgAssets {
    string internal constant LGBT = '${lgbt}';
    string internal constant MATRIX = '${matrix}';
    string internal constant GOLD = '${gold}';
}
`;

fs.writeFileSync(
    path.join(__dirname, "../../nft/contracts/utils/SvgAssets.sol"),
    solContent
);

console.log("SvgAssets.sol généré avec succès.");