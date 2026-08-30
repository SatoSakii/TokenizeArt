import hre from "hardhat";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const ITALIC = "\x1b[3m";

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";

// Adresse du contrat ALB42NFT déjà déployé sur Sepolia.
const NFT_ADDRESS = "0x85FC0D33d5b335F6007D8b02eF23f5F145C15338";

// Style à minter : 0 = lgbt, 1 = matrix, 2 = gold (voir contracts/ALB42NFT.sol)
const STYLE = 0;

async function main()
{
	const { ethers } = await hre.network.create();

	// Récupère une référence vers le contrat déjà déployé,
	// à partir de son adresse et de son nom (pour retrouver l'ABI dans artifacts/).
	const nft = await ethers.getContractAt("ALB42NFT", NFT_ADDRESS);

	const [signer] = await ethers.getSigners();

	// Mint le NFT vers l'adresse du signataire courant (le wallet owner du contrat).
	const tx = await nft.safeMint(signer.address, STYLE);
	const receipt = await tx.wait();

	// Récupère le tokenId réellement attribué depuis l'event Transfer émis.
	const transferEvent = receipt.logs
		.map((log: any) => {
			try { return nft.interface.parseLog(log); } catch { return null; }
		})
		.find((parsed: any) => parsed?.name === "Transfer");

	const tokenId = transferEvent?.args?.tokenId;

	console.log(
		` ${GREEN}${BOLD}${ITALIC}✓${RESET}  minted\t${GREEN}${BOLD}${ITALIC}ALB42NFT #${tokenId}${RESET}`
	);
	console.log(
		` ${GRAY}└─ owner\t${RESET}${CYAN}${BOLD}${signer.address}${RESET}\n`
	);
}

main().catch((error) => {
	console.error(
		` ${RED}${BOLD}${ITALIC}✗${RESET}  mint failed`
	);
	console.error(error);
	process.exitCode = 1;
});