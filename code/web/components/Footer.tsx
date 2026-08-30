"use client";

import { CopyChip, Label } from "@/components/ui";
import { CHAIN_NAME, EXPLORER, NFT_ADDRESS, addressUrl } from "@/lib/contract";

export function Footer() {
	return (
		<footer className="border-t border-line">
			<div className="mx-auto max-w-6xl px-5 py-10 flex flex-wrap items-center justify-between gap-6">
				<div>
					<Label>ALB42NFT · TokenizeArt</Label>
					<p className="mt-3 font-mono text-[11px] text-muted">
						ERC-721 ecrit a la main, image et metadonnees generees on-chain.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<CopyChip value={NFT_ADDRESS} label="copier l'adresse" />

					<a
						href={addressUrl(NFT_ADDRESS)}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center h-8 px-3 border border-line font-mono text-[11px] text-muted hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-colors"
					>
						contrat ↗
					</a>

					<a
						href={`${EXPLORER}/token/${NFT_ADDRESS}`}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center h-8 px-3 border border-line font-mono text-[11px] text-muted hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-colors"
					>
						{CHAIN_NAME} ↗
					</a>
				</div>
			</div>
		</footer>
	);
}
