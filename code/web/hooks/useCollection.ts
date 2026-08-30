"use client";

import { useCallback, useEffect, useState } from "react";

import { decodeTokenURI, getContract } from "@/lib/contract";

export type Token = {
	id: number;
	owner: string;
	styleIndex: number;
	name: string;
	description: string;
	/** Data URI base64 renvoyee par le contrat : l image vient bien de la blockchain. */
	image: string;
};

type Snapshot = {
	/** Adresse du proprietaire du contrat (seule autorisee a appeler safeMint). */
	contractOwner: string;
	/** Nombre de tokens deja mintes. */
	supply: number;
	/** Derniers tokens mintes, du plus recent au plus ancien. */
	tokens: Token[];
};

export type CollectionState = {
	contractOwner: string | null;
	supply: number;
	tokens: Token[];
	loading: boolean;
	error: string | null;
	/** Relit le contrat, typiquement apres un mint. */
	refresh: () => Promise<void>;
};

// On n affiche que les derniers tokens : inutile de rejouer toute la collection
// a chaque chargement de page.
const MAX_TOKENS = 12;

export async function fetchToken(tokenId: number): Promise<Token> {
	const contract = getContract();

	const [owner, tokenURI, styleIndex] = await Promise.all([
		contract.ownerOf(tokenId) as Promise<string>,
		contract.tokenURI(tokenId) as Promise<string>,
		contract.getStyle(tokenId) as Promise<bigint>,
	]);

	const metadata = decodeTokenURI(tokenURI);

	return {
		id: tokenId,
		owner,
		styleIndex: Number(styleIndex),
		name: metadata?.name ?? `ALB42NFT #${tokenId}`,
		description: metadata?.description ?? "",
		image: metadata?.image ?? "",
	};
}

/** Lecture pure du contrat : aucune mise a jour d etat React ici. */
async function fetchSnapshot(): Promise<Snapshot> {
	const contract = getContract();

	const [contractOwner, nextTokenId] = await Promise.all([
		contract.owner() as Promise<string>,
		contract.nextTokenId() as Promise<bigint>,
	]);

	// nextTokenId pointe sur le prochain identifiant libre : la supply est donc nextTokenId - 1.
	const supply = Number(nextTokenId) - 1;

	const ids: number[] = [];
	for (let id = supply; id > 0 && ids.length < MAX_TOKENS; id--) ids.push(id);

	const tokens = await Promise.all(ids.map((id) => fetchToken(id)));

	return { contractOwner, supply, tokens };
}

export function useCollection(): CollectionState {
	const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// L etat n est mis a jour que dans les callbacks de la promesse, une fois
	// toutes les lectures terminees.
	const refresh = useCallback(() => {
		return fetchSnapshot().then(
			(next) => {
				setSnapshot(next);
				setError(null);
				setLoading(false);
			},
			() => {
				setError("Lecture du contrat impossible. Le RPC Sepolia est peut-etre indisponible.");
				setLoading(false);
			},
		);
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return {
		contractOwner: snapshot?.contractOwner ?? null,
		supply: snapshot?.supply ?? 0,
		tokens: snapshot?.tokens ?? [],
		loading,
		error,
		refresh,
	};
}
