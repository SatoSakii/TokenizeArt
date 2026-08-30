"use client";

import { BrowserProvider, type Eip1193Provider } from "ethers";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { CHAIN_ID, CHAIN_ID_HEX, CHAIN_NAME } from "@/lib/contract";

// Un wallet type MetaMask s injecte dans la page sous window.ethereum (standard EIP-1193).
type InjectedProvider = Eip1193Provider & {
	on?: (event: string, handler: (...args: never[]) => void) => void;
	removeListener?: (event: string, handler: (...args: never[]) => void) => void;
};

declare global {
	interface Window {
		ethereum?: InjectedProvider;
	}
}

export type WalletState = {
	/** Un wallet injecte est-il disponible dans le navigateur ? */
	hasProvider: boolean;
	/** Adresse connectee, ou null si aucune connexion. */
	address: string | null;
	/** Chaine actuellement selectionnee dans le wallet. */
	chainId: number | null;
	/** Le wallet est-il bien sur Sepolia ? */
	isRightChain: boolean;
	connecting: boolean;
	error: string | null;
	connect: () => Promise<void>;
	switchChain: () => Promise<void>;
	getSigner: () => Promise<import("ethers").JsonRpcSigner>;
};

function readErrorMessage(error: unknown): string {
	if (typeof error === "object" && error !== null) {
		const candidate = error as { shortMessage?: string; message?: string };
		if (candidate.shortMessage) return candidate.shortMessage;
		if (candidate.message) return candidate.message;
	}

	return "Une erreur inconnue est survenue.";
}

// Aucune souscription n est necessaire : le wallet s injecte avant l hydratation.
// Le snapshot serveur vaut false, ce qui evite toute divergence d hydratation.
const noopSubscribe = () => () => {};
const readInjected = () => Boolean(window.ethereum);
const readInjectedOnServer = () => false;

export function useWallet(): WalletState {
	const hasProvider = useSyncExternalStore(
		noopSubscribe,
		readInjected,
		readInjectedOnServer,
	);

	const [address, setAddress] = useState<string | null>(null);
	const [chainId, setChainId] = useState<number | null>(null);
	const [connecting, setConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Au chargement : on regarde si le site est deja autorise par le wallet,
	// sans jamais ouvrir de popup (eth_accounts et non eth_requestAccounts).
	useEffect(() => {
		const injected = window.ethereum;

		if (!injected) return;

		let cancelled = false;

		const sync = async () => {
			try {
				const accounts = (await injected.request({ method: "eth_accounts" })) as string[];
				const currentChain = (await injected.request({ method: "eth_chainId" })) as string;

				if (cancelled) return;

				setAddress(accounts[0] ?? null);
				setChainId(Number.parseInt(currentChain, 16));
			} catch {
				// Wallet indisponible : le site reste utilisable en lecture seule.
			}
		};

		void sync();

		const onAccounts = (...args: never[]) => {
			const accounts = args[0] as unknown as string[];
			setAddress(accounts?.[0] ?? null);
		};

		const onChain = (...args: never[]) => {
			const hex = args[0] as unknown as string;
			setChainId(Number.parseInt(hex, 16));
		};

		injected.on?.("accountsChanged", onAccounts);
		injected.on?.("chainChanged", onChain);

		return () => {
			cancelled = true;
			injected.removeListener?.("accountsChanged", onAccounts);
			injected.removeListener?.("chainChanged", onChain);
		};
	}, []);

	const connect = useCallback(async () => {
		const injected = window.ethereum;

		if (!injected) {
			setError("Aucun wallet detecte. Installe MetaMask pour minter.");
			return;
		}

		setConnecting(true);
		setError(null);

		try {
			const accounts = (await injected.request({
				method: "eth_requestAccounts",
			})) as string[];

			const currentChain = (await injected.request({ method: "eth_chainId" })) as string;

			setAddress(accounts[0] ?? null);
			setChainId(Number.parseInt(currentChain, 16));
		} catch (err) {
			setError(readErrorMessage(err));
		} finally {
			setConnecting(false);
		}
	}, []);

	// Demande au wallet de basculer sur Sepolia, et propose de l ajouter s il ne la connait pas.
	const switchChain = useCallback(async () => {
		const injected = window.ethereum;

		if (!injected) return;

		setError(null);

		try {
			await injected.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: CHAIN_ID_HEX }],
			});
		} catch (err) {
			const code = (err as { code?: number }).code;

			// 4902 : la chaine est inconnue du wallet, on l ajoute avant de reessayer.
			if (code === 4902) {
				try {
					await injected.request({
						method: "wallet_addEthereumChain",
						params: [
							{
								chainId: CHAIN_ID_HEX,
								chainName: `${CHAIN_NAME} test network`,
								nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
								rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
								blockExplorerUrls: ["https://sepolia.etherscan.io"],
							},
						],
					});
				} catch (addError) {
					setError(readErrorMessage(addError));
				}

				return;
			}

			setError(readErrorMessage(err));
		}
	}, []);

	const getSigner = useCallback(async () => {
		const injected = window.ethereum;

		if (!injected) throw new Error("Aucun wallet detecte.");

		const provider = new BrowserProvider(injected);
		return provider.getSigner();
	}, []);

	return {
		hasProvider,
		address,
		chainId,
		isRightChain: chainId === CHAIN_ID,
		connecting,
		error,
		connect,
		switchChain,
		getSigner,
	};
}
