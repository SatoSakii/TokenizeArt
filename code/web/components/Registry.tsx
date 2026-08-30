"use client";

import { ZeroAddress } from "ethers";
import { useState } from "react";

import { ArtworkFrame } from "@/components/ArtworkFrame";
import { Button, Label, cx } from "@/components/ui";
import type { Token } from "@/hooks/useCollection";
import { styleByIndex } from "@/lib/artwork";
import { addressUrl, getContract, shortAddress, tokenUrl } from "@/lib/contract";

type Props = {
	tokens: Token[];
	loading: boolean;
	error: string | null;
	/** Adresse connectee, pour marquer les tokens possedes par l utilisateur. */
	viewer: string | null;
};

export function Registry({ tokens, loading, error, viewer }: Props) {
	return (
		<section className="mx-auto max-w-6xl px-5 py-16">
			<div className="flex flex-wrap items-end justify-between gap-6">
				<div>
					<Label>Registre</Label>
					<h2 className="mt-3 text-2xl tracking-tight">Tokens mintes</h2>
					<p className="mt-2 max-w-md font-mono text-[11px] leading-relaxed text-muted">
						Chaque vignette est lue directement sur Sepolia : image decodee depuis
						tokenURI, proprietaire renvoye par ownerOf.
					</p>
				</div>

				<OwnerLookup />
			</div>

			{error ? (
				<p className="mt-10 border border-red-400/30 bg-red-400/5 px-5 py-4 font-mono text-[11px] text-red-300">
					{error}
				</p>
			) : loading && tokens.length === 0 ? (
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }, (_, index) => (
						<div key={index} className="border border-line bg-surface">
							<div className="aspect-square bg-raised animate-dot" />
							<div className="h-[74px]" />
						</div>
					))}
				</div>
			) : tokens.length === 0 ? (
				<p className="mt-10 border border-line bg-surface px-5 py-8 font-mono text-[11px] text-muted">
					Aucun token minte pour l&apos;instant.
				</p>
			) : (
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{tokens.map((token) => (
						<TokenCard key={token.id} token={token} viewer={viewer} />
					))}
				</div>
			)}
		</section>
	);
}

function TokenCard({ token, viewer }: { token: Token; viewer: string | null }) {
	const style = styleByIndex(token.styleIndex);
	const owned = Boolean(viewer && viewer.toLowerCase() === token.owner.toLowerCase());

	return (
		<article
			className="group border border-line bg-surface transition-colors hover:border-faint"
			style={{ ["--accent" as string]: style.accent }}
		>
			<ArtworkFrame image={token.image} alt={token.name} />

			<div className="px-4 py-4">
				<div className="flex items-center justify-between gap-2">
					<span className="font-mono text-[12px] text-fg">#{token.id}</span>
					<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
						{style.label}
					</span>
				</div>

				<div className="mt-3 flex items-center justify-between gap-2">
					<a
						href={addressUrl(token.owner)}
						target="_blank"
						rel="noreferrer"
						className="font-mono text-[11px] text-muted hover:text-[var(--accent)] transition-colors"
						title={token.owner}
					>
						{shortAddress(token.owner)}
					</a>

					<a
						href={tokenUrl(token.id)}
						target="_blank"
						rel="noreferrer"
						className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint hover:text-[var(--accent)] transition-colors"
					>
						etherscan ↗
					</a>
				</div>

				{owned ? (
					<p className="mt-3 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
						a toi
					</p>
				) : null}
			</div>
		</article>
	);
}

/** Verification manuelle du proprietaire d un token via ownerOf(tokenId). */
function OwnerLookup() {
	const [tokenId, setTokenId] = useState("");
	const [result, setResult] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function lookup() {
		const id = Number(tokenId);

		if (!Number.isInteger(id) || id <= 0) {
			setResult(null);
			setError("Identifiant de token invalide.");
			return;
		}

		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const owner = (await getContract().ownerOf(id)) as string;

			// ownerOf est un getter de mapping : pour un token jamais minte il ne
			// revert pas, il renvoie l adresse zero.
			if (owner === ZeroAddress) {
				setError(`Le token #${id} n'existe pas.`);
			} else {
				setResult(owner);
			}
		} catch {
			setError("Lecture impossible sur Sepolia.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full sm:w-auto">
			<Label>ownerOf(tokenId)</Label>

			<form
				className="mt-3 flex gap-2"
				onSubmit={(event) => {
					event.preventDefault();
					void lookup();
				}}
			>
				<input
					value={tokenId}
					onChange={(event) => setTokenId(event.target.value)}
					inputMode="numeric"
					placeholder="1"
					aria-label="Identifiant du token"
					className={cx(
						"h-11 w-28 px-3 bg-ink border border-line font-mono text-[12px] text-fg placeholder:text-faint",
					)}
				/>
				<Button type="submit" variant="outline" disabled={loading}>
					{loading ? "…" : "Verifier"}
				</Button>
			</form>

			<p className="mt-3 h-4 font-mono text-[11px]">
				{error ? (
					<span className="text-red-400">{error}</span>
				) : result ? (
					<a
						href={addressUrl(result)}
						target="_blank"
						rel="noreferrer"
						className="text-[var(--accent)] hover:underline"
						title={result}
					>
						{shortAddress(result, 6)}
					</a>
				) : null}
			</p>
		</div>
	);
}
