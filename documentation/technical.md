# Choix techniques

## Langage : Solidity

Même choix que sur le projet Tokenizer précédent : Solidity reste le langage de référence pour les smart contracts EVM, le plus documenté et le mieux supporté par l'outillage (Hardhat, Etherscan, MetaMask).

## Standard : ERC-721

| Standard | Usage | Pourquoi pas ici |
|---|---|---|
| ERC-20 | Tokens fongibles, interchangeables | Hors sujet - une œuvre d'art doit être unique, pas divisible |
| **ERC-721** | Tokens non-fongibles, chacun unique et identifié par un `tokenId` | **Choisi** - le standard NFT de référence, celui explicitement demandé par le sujet

## Contrat écrit à la main

Comme pour `ALB42` (le projet Tokenizer), ce choix est délibérément pédagogique : `ALB42NFT.sol` réimplémente lui-même `ownerOf`, `balanceOf`, `transferFrom`, ainsi que la vérification `onERC721Received` (le mécanisme "safe" du standard), plutôt que d'hériter du contrat `ERC721` d'OpenZeppelin. L'objectif est de comprendre ce que fait réellement chaque fonction du standard, notamment le piège classique des NFT envoyés vers des contrats qui ne savent pas les gérer - d'où l'implémentation manuelle de `safeMint`.

## Stockage des métadonnées : 100% on-chain, pas IPFS

Le sujet suggère IPFS ("distributed registry technology, for example") sans l'imposer strictement. Ce projet va plus loin : l'image (SVG) et le JSON de métadonnées sont **générés et encodés directement dans le contrat**, via `tokenURI`, sous forme de Data URI base64 (`data:application/json;base64,...`).

| Approche | Dépendance externe | Pérennité | Coût de déploiement |
|---|---|---|---|
| IPFS | Un service de pinning doit rester actif | Dépend de ce service | Faible (le contrat ne stocke qu'un lien) |
| **100% on-chain** | Aucune | Le NFT existe tant que la blockchain existe, indépendamment de tout service tiers | Plus élevé (le SVG est stocké dans le bytecode du contrat) |

Ce choix permet de satisfaire le mandatory (stockage sur un "registre distribué" - la blockchain elle-même en est un) et le bonus "gérer les inscriptions on-chain" en une seule architecture, plutôt que de maintenir deux systèmes de stockage différents.

## Génération des images : SVG dessiné à la main, pas de tracé photo

Les 3 designs (LGBT, Matrix, Gold) sont des SVG écrits avec des formes géométriques simples (rectangles, polygones, dégradés), pas des images bitmap converties automatiquement. Un tracé automatique de photo produit des fichiers de plusieurs dizaines de Ko en SVG, ce qui poserait un risque réel de dépassement de la limite de taille de contrat déployé (24 576 octets, limite EIP-170) une fois combiné au reste du code (ERC-721, Base64, logique de style). Les 3 SVG actuels pèsent environ 1,3 à 2 Ko chacun, largement dans la marge.

## Environnement de développement : Hardhat

Même choix que sur Tokenizer, pour les mêmes raisons (TypeScript, écosystème Mocha/Ethers, documentation abondante) - voir le [`technical.md` du projet Tokenizer](https://github.com/SatoSakii/Tokenizer/blob/main/documentation/technical.md) pour le détail complet du comparatif avec Remix/Foundry/Truffle.

## Réseau : Ethereum Sepolia

Identique au choix fait sur Tokenizer - testnet de référence recommandé par la fondation Ethereum, faucets actifs, support natif MetaMask/Etherscan/Hardhat.

## Site de mint : Next.js + ethers.js, sans wrapper wallet

Pour le bonus "interface graphique de mint", Next.js a été choisi pour sa légèreté de configuration et parce que c'est une stack déjà maîtrisée. Volontairement, aucune bibliothèque de connexion wallet packagée (wagmi, RainbowKit, etc.) n'a été utilisée - la connexion MetaMask se fait directement via `window.ethereum` et `ethers.BrowserProvider`, pour garder le site aussi léger que possible et comprendre le mécanisme de connexion sans l'abstraire derrière une bibliothèque tierce.

Le site distingue deux rôles : n'importe quel visiteur peut consulter la collection (lecture seule, via `tokenURI`), mais seul le wallet correspondant à `owner()` voit apparaître le bouton de mint - cohérence directe avec la protection `onlyOwner` du contrat, pas de duplication de logique de sécurité côté front (le contrat refuserait de toute façon un mint venant d'un autre wallet).