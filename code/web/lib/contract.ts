import { Contract, JsonRpcProvider, type Provider, type Signer } from "ethers";

// Adresse du contrat ALB42NFT deploye sur le testnet Sepolia.
export const NFT_ADDRESS = "0xa93A8D0891B55c38A975F68cCa1768BEaEBD438b";

// Sepolia : 11155111 en decimal, 0xaa36a7 en hexadecimal (format attendu par MetaMask).
export const CHAIN_ID = 11155111;
export const CHAIN_ID_HEX = "0xaa36a7";
export const CHAIN_NAME = "Sepolia";

export const EXPLORER = "https://sepolia.etherscan.io";

// RPC public utilise pour les lectures (supply, ownerOf, tokenURI...) :
// le site reste consultable meme sans wallet connecte.
export const RPC_URL =
	process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

// ABI minimale : uniquement les fonctions et l evenement dont le site a besoin.
export const NFT_ABI = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function owner() view returns (address)",
	"function nextTokenId() view returns (uint256)",
	"function balanceOf(address) view returns (uint256)",
	"function ownerOf(uint256) view returns (address)",
	"function tokenURI(uint256) view returns (string)",
	"function getStyle(uint256) view returns (uint8)",
	"function safeMint(address to, uint8 style) returns (uint256)",
	"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const;

// Provider en lecture seule, partage entre tous les appels du site.
let readProvider: JsonRpcProvider | null = null;

export function getReadProvider(): JsonRpcProvider {
	if (!readProvider) {
		readProvider = new JsonRpcProvider(
			RPC_URL,
			{ chainId: CHAIN_ID, name: CHAIN_NAME.toLowerCase() },
			{ staticNetwork: true },
		);
	}

	return readProvider;
}

export function getContract(runner: Provider | Signer = getReadProvider()): Contract {
	return new Contract(NFT_ADDRESS, NFT_ABI, runner);
}

export type TokenMetadata = {
	name: string;
	description: string;
	image: string;
};

// Le contrat renvoie une data URI base64 : on la decode cote client
// pour recuperer le JSON, sans jamais dependre d un serveur externe.
export function decodeTokenURI(tokenURI: string): TokenMetadata | null {
	const prefix = "data:application/json;base64,";

	if (!tokenURI.startsWith(prefix)) return null;

	try {
		const json = atob(tokenURI.slice(prefix.length));
		return JSON.parse(json) as TokenMetadata;
	} catch {
		return null;
	}
}

export function txUrl(hash: string): string {
	return `${EXPLORER}/tx/${hash}`;
}

export function addressUrl(address: string): string {
	return `${EXPLORER}/address/${address}`;
}

export function tokenUrl(tokenId: number | string): string {
	return `${EXPLORER}/nft/${NFT_ADDRESS}/${tokenId}`;
}

export function shortAddress(address: string, size = 4): string {
	if (!address) return "";
	return `${address.slice(0, 2 + size)}…${address.slice(-size)}`;
}
