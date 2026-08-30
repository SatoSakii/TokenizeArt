"use client";

import { isAddress } from "ethers";
import { useState } from "react";

import { Button, Dot, Label, cx } from "@/components/ui";
import { fetchToken, type Token } from "@/hooks/useCollection";
import type { WalletState } from "@/hooks/useWallet";
import { STYLES } from "@/lib/artwork";
import {
	CHAIN_NAME,
	addressUrl,
	getContract,
	shortAddress,
	tokenUrl,
	txUrl,
} from "@/lib/contract";

type Status = "idle" | "signing" | "pending" | "done" | "error";

type Props = {
	wallet: WalletState;
	contractOwner: string | null;
	styleIndex: number;
	onSelectStyle: (index: number) => void;
	onMinted: (token: Token) => void;
};

function sameAddress(a?: string | null, b?: string | null): boolean {
	return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}

function readError(error: unknown): string {
	const err = error as { code?: string; shortMessage?: string; reason?: string; message?: string };

	// Refus explicite de l utilisateur dans la fenetre du wallet.
	if (err?.code === "ACTION_REJECTED") return "Transaction refusee dans le wallet.";

	return err?.reason ?? err?.shortMessage ?? err?.message ?? "Le mint a echoue.";
}

export function MintPanel({
	wallet,
	contractOwner,
	styleIndex,
	onSelectStyle,
	onMinted,
}: Props) {
	// null tant que le champ n a pas ete touche : on affiche alors le wallet connecte.
	const [recipientInput, setRecipientInput] = useState<string | null>(null);
	const [status, setStatus] = useState<Status>("idle");
	const [txHash, setTxHash] = useState<string | null>(null);
	const [mintedId, setMintedId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Par defaut on mint vers le wallet connecte ; le champ reste editable
	// car safeMint(to, style) accepte n importe quelle adresse de destination.
	const recipient = recipientInput ?? wallet.address ?? "";

	const isOwner = sameAddress(wallet.address, contractOwner);
	const target = recipient.trim();
	const validRecipient = isAddress(target);
	const busy = status === "signing" || status === "pending";

	const canMint =
		Boolean(wallet.address) && wallet.isRightChain && isOwner && validRecipient && !busy;

	async function mint() {
		setError(null);
		setTxHash(null);
		setMintedId(null);
		setStatus("signing");

		try {
			const signer = await wallet.getSigner();
			const contract = getContract(signer);

			// Appel de safeMint : le contrat verifie lui meme le style, le owner
			// et le fait que le destinataire sache recevoir un ERC-721.
			const tx = await contract.safeMint(target, styleIndex);

			setTxHash(tx.hash);
			setStatus("pending");

			const receipt = await tx.wait();

			// L identifiant reel du token est lu dans l evenement Transfer emis par le mint.
			const transfer = receipt.logs
				.map((log: { topics: readonly string[]; data: string }) => {
					try {
						return contract.interface.parseLog(log);
					} catch {
						return null;
					}
				})
				.find((parsed: { name: string } | null) => parsed?.name === "Transfer");

			const tokenId = Number(transfer?.args?.tokenId ?? 0);

			setMintedId(tokenId);
			setStatus("done");

			if (tokenId > 0) onMinted(await fetchToken(tokenId));
		} catch (err) {
			setError(readError(err));
			setStatus("error");
		}
	}

	return (
		<section className="flex flex-col">
			<div className="border border-line bg-surface">
				{/* Choix du style : l index correspond a l enum du contrat (0/1/2). */}
				<div className="px-5 pt-5 pb-4 border-b border-line">
					<Label>01 — Style de l&apos;oeuvre</Label>

					<div className="mt-4 grid grid-cols-3 gap-2">
						{STYLES.map((style) => {
							const selected = style.index === styleIndex;

							return (
								<button
									key={style.id}
									type="button"
									onClick={() => onSelectStyle(style.index)}
									aria-pressed={selected}
									className={cx(
										"group border px-3 py-3 text-left transition-colors duration-150",
										selected
											? "border-[var(--accent)] bg-raised"
											: "border-line hover:border-faint",
									)}
								>
									<span
										aria-hidden
										className="block size-2.5 rounded-full"
										style={{ backgroundColor: style.accent }}
									/>
									<span className="mt-3 block font-mono text-[12px] text-fg">
										{style.label}
									</span>
									<span className="mt-1 block font-mono text-[10px] text-faint">
										style {style.index}
									</span>
								</button>
							);
						})}
					</div>

					<p className="mt-3 font-mono text-[11px] text-muted">
						{STYLES[styleIndex].tagline}
					</p>
				</div>

				{/* Destinataire du mint. */}
				<div className="px-5 py-5 border-b border-line">
					<div className="flex items-center justify-between gap-3">
						<Label>02 — Destinataire</Label>

						{wallet.address ? (
							<button
								type="button"
								onClick={() => setRecipientInput(wallet.address)}
								className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint hover:text-[var(--accent)] transition-colors"
							>
								mon adresse
							</button>
						) : null}
					</div>

					<input
						value={recipient}
						onChange={(event) => setRecipientInput(event.target.value)}
						spellCheck={false}
						placeholder="0x…"
						aria-label="Adresse du destinataire"
						className={cx(
							"mt-3 w-full h-11 px-3 bg-ink border font-mono text-[12px] text-fg placeholder:text-faint transition-colors",
							target && !validRecipient ? "border-red-400/60" : "border-line",
						)}
					/>

					{target && !validRecipient ? (
						<p className="mt-2 font-mono text-[11px] text-red-400">
							Adresse Ethereum invalide.
						</p>
					) : null}
				</div>

				{/* Action + garde-fous. */}
				<div className="px-5 py-5">
					<Label>03 — Mint</Label>

					<Button
						onClick={() => void mint()}
						disabled={!canMint}
						className="mt-4 w-full h-12"
					>
						{status === "signing"
							? "Signature…"
							: status === "pending"
								? "Confirmation…"
								: "Minter le NFT"}
					</Button>

					<Gate
						wallet={wallet}
						contractOwner={contractOwner}
						isOwner={isOwner}
						status={status}
						txHash={txHash}
						mintedId={mintedId}
						error={error}
					/>
				</div>
			</div>
		</section>
	);
}

/**
 * Zone d etat sous le bouton : explique precisement ce qui bloque le mint
 * (wallet absent, mauvais reseau, privilege owner) ou ce qui vient de se passer.
 */
function Gate({
	wallet,
	contractOwner,
	isOwner,
	status,
	txHash,
	mintedId,
	error,
}: {
	wallet: WalletState;
	contractOwner: string | null;
	isOwner: boolean;
	status: Status;
	txHash: string | null;
	mintedId: number | null;
	error: string | null;
}) {
	if (status === "done" && mintedId) {
		return (
			<Notice tone="live" className="animate-rise">
				<span className="text-fg">ALB42NFT #{mintedId} minte.</span>{" "}
				<a
					href={tokenUrl(mintedId)}
					target="_blank"
					rel="noreferrer"
					className="text-[var(--accent)] hover:underline"
				>
					voir sur Etherscan
				</a>
				{txHash ? (
					<>
						{" · "}
						<a
							href={txUrl(txHash)}
							target="_blank"
							rel="noreferrer"
							className="text-[var(--accent)] hover:underline"
						>
							transaction
						</a>
					</>
				) : null}
			</Notice>
		);
	}

	if (status === "error" && error) {
		return <Notice tone="error">{error}</Notice>;
	}

	if (status === "pending" && txHash) {
		return (
			<Notice tone="warn">
				Transaction envoyee, en attente d&apos;un bloc —{" "}
				<a
					href={txUrl(txHash)}
					target="_blank"
					rel="noreferrer"
					className="text-[var(--accent)] hover:underline"
				>
					{shortAddress(txHash, 6)}
				</a>
			</Notice>
		);
	}

	if (!wallet.hasProvider) {
		return (
			<Notice tone="idle">
				Aucun wallet detecte dans ce navigateur. Installe MetaMask pour minter — la
				collection reste consultable sans wallet.
			</Notice>
		);
	}

	if (!wallet.address) {
		return <Notice tone="idle">Connecte ton wallet pour continuer.</Notice>;
	}

	if (!wallet.isRightChain) {
		return (
			<Notice tone="warn">
				Ton wallet n&apos;est pas sur {CHAIN_NAME}.{" "}
				<button
					type="button"
					onClick={() => void wallet.switchChain()}
					className="text-[var(--accent)] hover:underline"
				>
					changer de reseau
				</button>
			</Notice>
		);
	}

	if (!isOwner) {
		return (
			<Notice tone="warn">
				<span className="text-fg">Mint reserve au proprietaire du contrat.</span> safeMint
				refuse tout autre appelant ; connecte-toi avec{" "}
				{contractOwner ? (
					<a
						href={addressUrl(contractOwner)}
						target="_blank"
						rel="noreferrer"
						className="text-[var(--accent)] hover:underline"
					>
						{shortAddress(contractOwner, 6)}
					</a>
				) : (
					"l'adresse owner"
				)}
				.
			</Notice>
		);
	}

	return (
		<Notice tone="live">
			Wallet owner reconnu — le mint coutera uniquement du gas de test {CHAIN_NAME}.
		</Notice>
	);
}

function Notice({
	tone,
	children,
	className,
}: {
	tone: "idle" | "live" | "warn" | "error";
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cx(
				"mt-4 flex gap-2.5 font-mono text-[11px] leading-relaxed text-muted",
				className,
			)}
		>
			<span className="mt-1.5">
				<Dot tone={tone} />
			</span>
			<span>{children}</span>
		</p>
	);
}
