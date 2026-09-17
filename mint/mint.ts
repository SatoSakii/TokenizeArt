import hre from "hardhat";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

// Adresse du contrat ALB42NFT déjà déployé sur Sepolia.
const NFT_ADDRESS = "0xa93A8D0891B55c38A975F68cCa1768BEaEBD438b";

// Styles disponibles, dans le même ordre que le mapping styleOf du contrat.
const STYLES = [
	{ index: 0, label: "Pride",  color: MAGENTA, tagline: "Degrade arc-en-ciel, contours nets" },
	{ index: 1, label: "Matrix", color: GREEN,   tagline: "Phosphore vert, pluie de code" },
	{ index: 2, label: "Gold",   color: YELLOW,  tagline: "Or brosse, halo chaud" },
];

const EXPLORER = "https://sepolia.etherscan.io";

function line(char = "─", width = 46): string {
	return `${GRAY}${char.repeat(width)}${RESET}`;
}

// Affiche le menu et boucle tant que la saisie n'est pas un style valide.
async function askStyle(): Promise<number> {
	const rl = readline.createInterface({ input, output });

	try {
		console.log(`\n ${BOLD}Choisis le style du NFT à minter${RESET}\n`);

		for (const style of STYLES) {
			console.log(
				`   ${style.color}${BOLD}${style.index}${RESET}  ${style.color}${style.label}${RESET}` +
				`  ${DIM}${style.tagline}${RESET}`
			);
		}

		console.log("");

		while (true) {
			const answer = (await rl.question(` ${CYAN}❯${RESET} style ${GRAY}[0-2]${RESET} : `)).trim();
			const parsed = Number(answer);

			if (Number.isInteger(parsed) && STYLES.some((style) => style.index === parsed))
				return parsed;

			console.log(` ${RED}✗${RESET}  Saisie invalide, entre 0, 1 ou 2.\n`);
		}
	} finally {
		rl.close();
	}
}

async function main()
{
	const style = await askStyle();
	const chosen = STYLES.find((entry) => entry.index === style)!;

	const { ethers } = await hre.network.create();

	// Récupère une référence vers le contrat déjà déployé,
	// à partir de son adresse et de son nom (pour retrouver l'ABI dans artifacts/).
	const nft = await ethers.getContractAt("ALB42NFT", NFT_ADDRESS);

	const [signer] = await ethers.getSigners();

	console.log(`\n${line()}`);
	console.log(` ${GRAY}contrat${RESET}\t${NFT_ADDRESS}`);
	console.log(` ${GRAY}wallet${RESET}\t${signer.address}`);
	console.log(` ${GRAY}style${RESET}\t${chosen.color}${BOLD}${chosen.label}${RESET} ${GRAY}(${chosen.index})${RESET}`);
	console.log(`${line()}\n`);

	console.log(` ${CYAN}${ITALIC}⋯${RESET}  transaction envoyée, en attente de confirmation...`);

	// Mint le NFT vers l'adresse du signataire courant (le wallet owner du contrat).
	const tx = await nft.safeMint(signer.address, style);
	const receipt = await tx.wait();

	// Récupère le tokenId réellement attribué depuis l'event Transfer émis :
	// la valeur de retour d'une fonction n'est pas accessible depuis une transaction.
	const transferEvent = receipt.logs
		.map((log: any) => {
			try { return nft.interface.parseLog(log); } catch { return null; }
		})
		.find((parsed: any) => parsed?.name === "Transfer");

	const tokenId = transferEvent?.args?.tokenId;

	console.log(`\n ${GREEN}${BOLD}${ITALIC}✓${RESET}  minted\t${GREEN}${BOLD}${ITALIC}ALB42NFT #${tokenId}${RESET}`);
	console.log(` ${GRAY}├─ style${RESET}\t${chosen.color}${chosen.label}${RESET}`);
	console.log(` ${GRAY}├─ owner${RESET}\t${CYAN}${signer.address}${RESET}`);
	console.log(` ${GRAY}├─ tx${RESET}\t\t${DIM}${EXPLORER}/tx/${receipt.hash}${RESET}`);
	console.log(` ${GRAY}└─ nft${RESET}\t\t${DIM}${EXPLORER}/nft/${NFT_ADDRESS}/${tokenId}${RESET}\n`);
}

main().catch((error) => {
	console.error(`\n ${RED}${BOLD}${ITALIC}✗${RESET}  mint failed`);
	console.error(error);
	process.exitCode = 1;
});