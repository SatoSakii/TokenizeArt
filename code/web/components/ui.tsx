"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]): string {
	return classes.filter(Boolean).join(" ");
}

/** Etiquette mono en capitales, utilisee pour titrer chaque bloc. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
	return <span className={cx("label", className)}>{children}</span>;
}

/** Surface encadree : la brique de base de toute la mise en page. */
export function Panel({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cx("border border-line bg-surface", className)}>{children}</div>
	);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "accent" | "outline" | "ghost";
};

export function Button({ variant = "accent", className, ...props }: ButtonProps) {
	const base =
		"inline-flex items-center justify-center gap-2 h-11 px-5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

	const variants = {
		// Desactive, le bouton passe en contour neutre : impossible de le confondre
		// avec un bouton actif simplement grisonne.
		accent:
			"bg-[var(--accent)] text-ink hover:bg-[color-mix(in_srgb,var(--accent)_82%,white)] disabled:opacity-100 disabled:bg-transparent disabled:border disabled:border-line disabled:text-faint",
		outline:
			"border border-line text-fg hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:hover:border-line disabled:hover:text-fg",
		ghost: "text-muted hover:text-fg",
	};

	return <button className={cx(base, variants[variant], className)} {...props} />;
}

/** Adresse cliquable qui se copie dans le presse-papier. */
export function CopyChip({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;

		const timer = setTimeout(() => setCopied(false), 1400);
		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<button
			type="button"
			onClick={() => {
				void navigator.clipboard?.writeText(value).then(() => setCopied(true));
			}}
			title={value}
			className="group inline-flex items-center gap-2 border border-line px-3 h-8 font-mono text-[11px] text-muted hover:text-fg hover:border-[var(--accent)]/50 transition-colors"
		>
			<span>{copied ? "copie" : (label ?? value)}</span>
			<span className="text-faint group-hover:text-[var(--accent)]">
				{copied ? "✓" : "⧉"}
			</span>
		</button>
	);
}

/** Bloc chiffre : une valeur mise en avant sous son etiquette. */
export function Stat({
	label,
	value,
	hint,
}: {
	label: string;
	value: ReactNode;
	hint?: ReactNode;
}) {
	return (
		<div className="px-5 py-4">
			<Label>{label}</Label>
			<div className="mt-2.5 font-mono text-lg text-fg tabular-nums">{value}</div>
			{hint ? <div className="mt-1 font-mono text-[11px] text-faint">{hint}</div> : null}
		</div>
	);
}

/** Petit point d etat, colore selon la situation (connecte, erreur, en attente...). */
export function Dot({ tone = "idle" }: { tone?: "idle" | "live" | "warn" | "error" }) {
	const tones = {
		idle: "bg-faint",
		live: "bg-emerald-400 animate-dot",
		warn: "bg-amber-400 animate-dot",
		error: "bg-red-400",
	};

	return <span className={cx("size-1.5 rounded-full shrink-0", tones[tone])} />;
}
