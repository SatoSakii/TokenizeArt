"use client";

import { cx } from "@/components/ui";

type Props = {
	/** SVG brut (apercu local) - utilise si `image` n est pas fourni. */
	svg?: string;
	/** Data URI renvoyee par le contrat (token deja minte). */
	image?: string;
	alt: string;
	className?: string;
};

/**
 * Cadre carre qui affiche l oeuvre, avec quatre reperes d angle facon planche technique.
 * Le SVG est inline (apercu) ou charge depuis la data URI on-chain (token existant).
 */
export function ArtworkFrame({ svg, image, alt, className }: Props) {
	return (
		<div className={cx("relative aspect-square bg-black overflow-hidden", className)}>
			{image ? (
				// eslint-disable-next-line @next/next/no-img-element -- data URI on-chain, pas d optimisation possible
				<img src={image} alt={alt} className="size-full object-cover" />
			) : svg ? (
				<div
					role="img"
					aria-label={alt}
					className="size-full [&>svg]:size-full [&>svg]:block"
					dangerouslySetInnerHTML={{ __html: svg }}
				/>
			) : (
				<div className="size-full grid place-items-center label">indisponible</div>
			)}

			<Corner className="top-0 left-0 border-t border-l" />
			<Corner className="top-0 right-0 border-t border-r" />
			<Corner className="bottom-0 left-0 border-b border-l" />
			<Corner className="bottom-0 right-0 border-b border-r" />
		</div>
	);
}

function Corner({ className }: { className: string }) {
	return (
		<span
			aria-hidden
			className={cx("pointer-events-none absolute size-4 border-[var(--accent)]", className)}
		/>
	);
}
