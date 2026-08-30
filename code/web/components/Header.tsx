"use client";

import { Button, Dot, Label, cx } from "@/components/ui";
import type { WalletState } from "@/hooks/useWallet";
import { CHAIN_NAME, NFT_ADDRESS, addressUrl, shortAddress } from "@/lib/contract";

export function Header({ wallet }: { wallet: WalletState }) {
	const connected = Boolean(wallet.address);

	return (
		<header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur-md">
			<div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
				<div className="flex items-center gap-4 min-w-0">
					<span className="font-mono text-sm tracking-[0.2em] text-fg">ALB42NFT</span>

					<span aria-hidden className="hidden sm:block h-4 w-px bg-line" />

					<a
						href={addressUrl(NFT_ADDRESS)}
						target="_blank"
						rel="noreferrer"
						className="hidden sm:block font-mono text-[11px] text-faint hover:text-[var(--accent)] transition-colors truncate"
					>
						{shortAddress(NFT_ADDRESS, 6)}
					</a>
				</div>

				<div className="flex items-center gap-3">
					<span
						className={cx(
							"hidden sm:flex items-center gap-2 h-8 px-3 border border-line",
							!connected || wallet.isRightChain ? "" : "border-amber-400/40",
						)}
					>
						<Dot tone={!connected ? "idle" : wallet.isRightChain ? "live" : "warn"} />
						<Label className="!text-muted">
							{!connected || wallet.isRightChain ? CHAIN_NAME : "mauvais reseau"}
						</Label>
					</span>

					{connected ? (
						wallet.isRightChain ? (
							<span className="inline-flex items-center h-11 px-4 border border-line font-mono text-[11px] text-fg">
								{shortAddress(wallet.address!)}
							</span>
						) : (
							<Button variant="outline" onClick={() => void wallet.switchChain()}>
								Passer sur {CHAIN_NAME}
							</Button>
						)
					) : (
						<Button onClick={() => void wallet.connect()} disabled={wallet.connecting}>
							{wallet.connecting ? "Connexion…" : "Connecter"}
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
