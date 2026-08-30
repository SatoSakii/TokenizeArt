import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
	variable: "--font-display",
	subsets: ["latin"],
	display: "swap",
});

const mono = JetBrains_Mono({
	variable: "--font-mono-code",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "ALB42NFT — mint on-chain",
	description:
		"Interface de mint du ALB42NFT : un ERC-721 dont l'image et les metadonnees sont stockees entierement on-chain, sur le testnet Sepolia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="fr"
			className={`${display.variable} ${mono.variable} h-full antialiased`}
		>
			<body className="bg-ink text-fg min-h-full font-sans flex flex-col">{children}</body>
		</html>
	);
}
