import hre from "hardhat";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const ITALIC = "\x1b[3m";

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";

async function main()
{
	// Récupération de l'instance d'Ethers.js
	// afin de pouvoir interagir avec le réseau Ethereum
	const { ethers } = await hre.network.create();

	// Déploiement du contrat ALB42NFT (aucun paramètre de constructeur nécessaire)
	const nft = await ethers.deployContract("ALB42NFT");

	// Attente de la confirmation du déploiement
	await nft.waitForDeployment();

	// Récupération de l'adresse du contrat déployé
	const address = await nft.getAddress();

	console.log(
		` ${GREEN}${BOLD}${ITALIC}✓${RESET}  deployed\t${GREEN}${BOLD}${ITALIC}ALB42NFT${RESET}`
	);

	console.log(
		` ${GRAY}└─ address\t${RESET}${CYAN}${BOLD}${address}${RESET}\n`
	);
}

main().catch((error) => {
	console.error(
		` ${RED}${BOLD}${ITALIC}✗${RESET}  deployment failed`
	);
	console.error(error);
	process.exitCode = 1;
});