"use client";

import { useEffect, useState } from "react";

import { ArtworkFrame } from "@/components/ArtworkFrame";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MintPanel } from "@/components/MintPanel";
import { Registry } from "@/components/Registry";
import { CopyChip, Label, Stat } from "@/components/ui";
import { useCollection, type Token } from "@/hooks/useCollection";
import { useWallet } from "@/hooks/useWallet";
import { ARTWORK_SVG, STYLES } from "@/lib/artwork";
import {
	CHAIN_NAME,
	NFT_ADDRESS,
	addressUrl,
	getContract,
	shortAddress,
} from "@/lib/contract";

export default function Home() {
	const wallet = useWallet();
	const collection = useCollection();

	const [styleIndex, setStyleIndex] = useState(0);
	const [minted, setMinted] = useState<Token | null>(null);
	// Le solde est memorise avec l adresse a laquelle il correspond : en changeant
	// de compte, on n affiche jamais le solde de l ancien wallet.
	const [balance, setBalance] = useState<{ address: string; value: number } | null>(null);

	const style = STYLES[styleIndex];

	// Solde du wallet connecte, relu apres chaque mint.
	useEffect(() => {
		const address = wallet.address;

		if (!address) return;

		let cancelled = false;

		getContract()
			.balanceOf(address)
			.then((value: bigint) => {
				if (!cancelled) setBalance({ address, value: Number(value) });
			})
			.catch(() => {
				// Lecture indisponible : le solde reste affiche comme inconnu.
			});

		return () => {
			cancelled = true;
		};
	}, [wallet.address, collection.supply]);

	const ownBalance =
		balance && balance.address === wallet.address ? balance.value : null;

	// A la fin d un mint : on affiche l oeuvre reelle et on rafraichit le registre.
	function handleMinted(token: Token) {
		setMinted(token);
		setStyleIndex(token.styleIndex);
		void collection.refresh();
	}

	return (
		// L accent de toute la page suit le style de NFT selectionne.
		<div style={{ ["--accent" as string]: style.accent }} className="flex-1 flex flex-col">
			<Header wallet={wallet} />

			<main className="flex-1">
				{/* Accroche */}
				<div className="grid-backdrop border-b border-line">
					<section className="relative mx-auto max-w-6xl px-5 pt-20 pb-16">
						<Label>ERC-721 · {CHAIN_NAME} · 100% on-chain</Label>

						<h1 className="mt-6 text-[2.75rem] sm:text-6xl lg:text-7xl leading-[0.94] tracking-[-0.035em]">
							Minte ton{" "}
							<span style={{ color: "var(--accent)" }} className="font-mono">
								42
							</span>
							,<br />
							grave dans la chaine.
						</h1>

						<p className="mt-7 max-w-xl font-mono text-[12px] leading-relaxed text-muted">
							Ni IPFS, ni serveur d&apos;images : le SVG et les metadonnees du token
							sont assembles par le contrat lui-meme, a chaque appel de{" "}
							<span className="text-fg">tokenURI</span>. Ce que tu vois ci-dessous sort
							litteralement de la blockchain.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-3">
							<CopyChip value={NFT_ADDRESS} label={shortAddress(NFT_ADDRESS, 6)} />
							<span className="inline-flex items-center h-8 px-3 border border-line font-mono text-[11px] text-muted">
								ALB42NFT
							</span>
						</div>
					</section>
				</div>

				{/* Apercu + mint */}
				<section className="mx-auto max-w-6xl px-5 py-16 grid gap-10 lg:grid-cols-2 lg:gap-14 items-start">
					<div className="lg:sticky lg:top-24">
						<div className="border border-line bg-surface">
							<ArtworkFrame
								svg={minted ? undefined : ARTWORK_SVG[style.id]}
								image={minted?.image}
								alt={minted ? minted.name : `Apercu du style ${style.label}`}
							/>

							<div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-line">
								<div>
									<span className="font-mono text-[12px] text-fg">
										{minted ? minted.name : `ALB42NFT #${collection.supply + 1}`}
									</span>
									<span className="mt-1 block label">
										{minted ? "minte · lu on-chain" : "apercu · non minte"}
									</span>
								</div>

								<span
									className="font-mono text-[10px] uppercase tracking-[0.16em]"
									style={{ color: "var(--accent)" }}
								>
									{style.label}
								</span>
							</div>
						</div>

						{minted ? (
							<button
								type="button"
								onClick={() => setMinted(null)}
								className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-faint hover:text-[var(--accent)] transition-colors"
							>
								← revenir a l&apos;apercu
							</button>
						) : null}
					</div>

					<MintPanel
						wallet={wallet}
						contractOwner={collection.contractOwner}
						styleIndex={styleIndex}
						onSelectStyle={(index) => {
							setStyleIndex(index);
							setMinted(null);
						}}
						onMinted={handleMinted}
					/>
				</section>

				{/* Etat du contrat */}
				<section className="border-y border-line">
					<div className="mx-auto max-w-6xl px-5 grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
						<Stat
							label="Tokens mintes"
							value={collection.loading && !collection.supply ? "-" : collection.supply}
							hint="nextTokenId − 1"
						/>
						<Stat
							label="Ton solde"
							value={ownBalance === null ? "-" : ownBalance}
							hint="balanceOf(toi)"
						/>
						<Stat
							label="Proprietaire"
							value={
								collection.contractOwner ? (
									<a
										href={addressUrl(collection.contractOwner)}
										target="_blank"
										rel="noreferrer"
										className="hover:text-[var(--accent)] transition-colors"
										title={collection.contractOwner}
									>
										{shortAddress(collection.contractOwner)}
									</a>
								) : (
									"-"
								)
							}
							hint="seul autorise a minter"
						/>
						<Stat label="Stockage" value="on-chain" hint="SVG + JSON en base64" />
					</div>
				</section>

				<Registry
					tokens={collection.tokens}
					loading={collection.loading}
					error={collection.error}
					viewer={wallet.address}
				/>
			</main>

			<Footer />
		</div>
	);
}
