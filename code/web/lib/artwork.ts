// Copies locales des SVG stockes on-chain (voir code/nft/contracts/utils/SvgAssets.sol).

export const ARTWORK_SVG = {
	lgbt: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\">\n  <defs>\n    <filter id=\"soft-shadow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">\n      <feDropShadow dx=\"0\" dy=\"2\" stdDeviation=\"4\" flood-color=\"#000000\" flood-opacity=\"0.35\"/>\n    </filter>\n  </defs>\n\n  <g>\n    <rect x=\"0\" y=\"0\"          width=\"400\" height=\"66.667\" fill=\"#E40303\"/>\n    <rect x=\"0\" y=\"66.667\"     width=\"400\" height=\"66.667\" fill=\"#FF8C00\"/>\n    <rect x=\"0\" y=\"133.333\"    width=\"400\" height=\"66.667\" fill=\"#FFED00\"/>\n    <rect x=\"0\" y=\"200\"        width=\"400\" height=\"66.667\" fill=\"#008026\"/>\n    <rect x=\"0\" y=\"266.667\"    width=\"400\" height=\"66.667\" fill=\"#004DFF\"/>\n    <rect x=\"0\" y=\"333.333\"    width=\"400\" height=\"66.667\" fill=\"#750787\"/>\n  </g>\n\n  <g fill=\"#000100\" filter=\"url(#soft-shadow)\"\n     transform=\"translate(70,108.75) scale(0.8045) translate(-20.39,-10.53)\">\n    <polygon points=\"199.02 10.53 139.48 10.53 20.39 129.61 20.39 177.82 139.48 177.82 139.48 237.36 199.02 237.36 199.02 129.61 79.94 129.61 199.02 10.53\"/>\n    <polygon points=\"224.54 70.07 284.08 10.53 224.54 10.53 224.54 70.07\"/>\n    <polygon points=\"343.62 70.07 343.62 10.53 284.08 10.53 284.08 70.07 224.54 129.61 224.54 189.16 284.08 189.16 284.08 129.61 343.62 70.07\"/>\n    <polygon points=\"343.62 129.61 284.08 189.16 343.62 189.16 343.62 129.61\"/>\n  </g>\n</svg>",
	matrix: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\">\n  <defs>\n    <linearGradient id=\"bg\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#020403\"/>\n      <stop offset=\"100%\" stop-color=\"#031a0d\"/>\n    </linearGradient>\n\n    <pattern id=\"scan\" width=\"400\" height=\"4\" patternUnits=\"userSpaceOnUse\">\n      <rect width=\"400\" height=\"2\" fill=\"#00ff66\" opacity=\"0.04\"/>\n      <rect y=\"2\" width=\"400\" height=\"2\" fill=\"#000000\" opacity=\"0.15\"/>\n    </pattern>\n\n    <filter id=\"glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">\n      <feGaussianBlur stdDeviation=\"3\" result=\"b\"/>\n      <feMerge>\n        <feMergeNode in=\"b\"/>\n        <feMergeNode in=\"SourceGraphic\"/>\n      </feMerge>\n    </filter>\n\n    <g id=\"mark\">\n      <polygon points=\"199.02 10.53 139.48 10.53 20.39 129.61 20.39 177.82 139.48 177.82 139.48 237.36 199.02 237.36 199.02 129.61 79.94 129.61 199.02 10.53\"/>\n      <polygon points=\"224.54 70.07 284.08 10.53 224.54 10.53 224.54 70.07\"/>\n      <polygon points=\"343.62 70.07 343.62 10.53 284.08 10.53 284.08 70.07 224.54 129.61 224.54 189.16 284.08 189.16 284.08 129.61 343.62 70.07\"/>\n      <polygon points=\"343.62 129.61 284.08 189.16 343.62 189.16 343.62 129.61\"/>\n    </g>\n  </defs>\n\n  <rect width=\"400\" height=\"400\" fill=\"url(#bg)\"/>\n  <rect width=\"400\" height=\"400\" fill=\"url(#scan)\"/>\n  <text x=\"10\" y=\"30\" font-family=\"monospace\" font-size=\"14\" fill=\"#00ff66\" opacity=\"0.35\">101010</text>\n  <text x=\"10\" y=\"385\" font-family=\"monospace\" font-size=\"14\" fill=\"#00ff66\" opacity=\"0.35\">ft_NFT</text>\n\n  <g transform=\"translate(70,108.75) scale(0.8045) translate(-20.39,-10.53)\" filter=\"url(#glow)\">\n    <use href=\"#mark\" fill=\"#ff2b6d\" transform=\"translate(-5,0)\" opacity=\"0.75\"/>\n    <use href=\"#mark\" fill=\"#00e5ff\" transform=\"translate(5,3)\" opacity=\"0.75\"/>\n    <use href=\"#mark\" fill=\"#00ff66\"/>\n  </g>\n</svg>",
	gold: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\">\n  <defs>\n    <radialGradient id=\"bg\" cx=\"50%\" cy=\"35%\" r=\"80%\">\n      <stop offset=\"0%\"  stop-color=\"#1a1408\"/>\n      <stop offset=\"70%\" stop-color=\"#0a0805\"/>\n      <stop offset=\"100%\" stop-color=\"#000000\"/>\n    </radialGradient>\n\n    <linearGradient id=\"gold\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\"   stop-color=\"#fff6d8\"/>\n      <stop offset=\"25%\"  stop-color=\"#e6c05c\"/>\n      <stop offset=\"50%\"  stop-color=\"#8a5a1f\"/>\n      <stop offset=\"75%\"  stop-color=\"#f3d27a\"/>\n      <stop offset=\"100%\" stop-color=\"#c9973b\"/>\n    </linearGradient>\n\n    <radialGradient id=\"vignette\" cx=\"50%\" cy=\"50%\" r=\"75%\">\n      <stop offset=\"60%\" stop-color=\"#000000\" stop-opacity=\"0\"/>\n      <stop offset=\"100%\" stop-color=\"#000000\" stop-opacity=\"0.7\"/>\n    </radialGradient>\n\n    <filter id=\"glow\" x=\"-40%\" y=\"-40%\" width=\"180%\" height=\"180%\">\n      <feGaussianBlur stdDeviation=\"5\" result=\"b\"/>\n      <feMerge>\n        <feMergeNode in=\"b\"/>\n        <feMergeNode in=\"SourceGraphic\"/>\n      </feMerge>\n    </filter>\n  </defs>\n\n  <rect width=\"400\" height=\"400\" fill=\"url(#bg)\"/>\n  <circle cx=\"200\" cy=\"200\" r=\"150\" fill=\"none\" stroke=\"url(#gold)\" stroke-width=\"1\" opacity=\"0.5\"/>\n  <circle cx=\"200\" cy=\"200\" r=\"165\" fill=\"none\" stroke=\"url(#gold)\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n\n  <g fill=\"url(#gold)\" filter=\"url(#glow)\"\n     transform=\"translate(70,108.75) scale(0.8045) translate(-20.39,-10.53)\">\n    <polygon points=\"199.02 10.53 139.48 10.53 20.39 129.61 20.39 177.82 139.48 177.82 139.48 237.36 199.02 237.36 199.02 129.61 79.94 129.61 199.02 10.53\"/>\n    <polygon points=\"224.54 70.07 284.08 10.53 224.54 10.53 224.54 70.07\"/>\n    <polygon points=\"343.62 70.07 343.62 10.53 284.08 10.53 284.08 70.07 224.54 129.61 224.54 189.16 284.08 189.16 284.08 129.61 343.62 70.07\"/>\n    <polygon points=\"343.62 129.61 284.08 189.16 343.62 189.16 343.62 129.61\"/>\n  </g>\n\n  <rect width=\"400\" height=\"400\" fill=\"url(#vignette)\"/>\n</svg>",
} as const;

export const STYLES = [
	{
		id: "lgbt" as const,
		index: 0,
		label: "Pride",
		tagline: "Degrade arc-en-ciel, contours nets",
		accent: "#ff4fd8",
	},
	{
		id: "matrix" as const,
		index: 1,
		label: "Matrix",
		tagline: "Phosphore vert, pluie de code",
		accent: "#3ddc84",
	},
	{
		id: "gold" as const,
		index: 2,
		label: "Gold",
		tagline: "Or brosse, halo chaud",
		accent: "#e6c05c",
	},
];

export type StyleId = (typeof STYLES)[number]["id"];

export function styleByIndex(index: number) {
	return STYLES.find((style) => style.index === index) ?? STYLES[0];
}
