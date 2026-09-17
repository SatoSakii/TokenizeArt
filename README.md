# ALB42NFT - TokenizeArt

Une collection **ERC-721** générée et stockée **entièrement on-chain** (aucune dépendance à IPFS ou à un serveur externe), déployée sur Ethereum Sepolia, avec un site Next.js pour visualiser et minter.

![Solidity](https://img.shields.io/badge/Solidity-0.8.34-blue)
![Standard](https://img.shields.io/badge/standard-ERC--721-purple)
![Network](https://img.shields.io/badge/network-Sepolia-8c8c8c)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- 🎨 **3 designs on-chain** - LGBT, Matrix, Gold, choisis au moment du mint
- 🔒 **`safeMint`** - vérifie que le destinataire (wallet ou contrat) sait recevoir un NFT (implémentation manuelle d'`onERC721Received`)
- 🧬 **Métadonnées + image générées et encodées en base64 directement dans le contrat** - `tokenURI` ne dépend d'aucun stockage externe
- 🖥️ **Site Next.js** pour connecter MetaMask, visualiser la collection et minter (réservé au owner)

## 📍 Contrat déployé

| | |
|---|---|
| Nom | ALB42NFT |
| Standard | ERC-721 |
| Réseau | Sepolia (Ethereum Testnet) |
| Adresse | [`0xa93A8D0891B55c38A975F68cCa1768BEaEBD438b`](https://sepolia.etherscan.io/address/0xa93A8D0891B55c38A975F68cCa1768BEaEBD438b) |
| Code source | ✅ Vérifié sur Etherscan |
| Métadonnées | 100% on-chain (Data URI base64, pas d'IPFS) |

## 📖 Documentation

La documentation complète se trouve dans [`documentation/`](./documentation/) :

- [Choix techniques](./documentation/technical.md) - Solidity, ERC-721, pourquoi on-chain plutôt qu'IPFS
- [Fonctionnement du contrat](./documentation/contract.md) - détail de chaque fonction, y compris la génération on-chain des métadonnées
- [Sécurité & privilèges](./documentation/security.md) - protection `onlyOwner`, vérification `onERC721Received`
- [Métadonnées on-chain](./documentation/metadata.md) - comment `tokenURI` génère le SVG + JSON + base64
- [Bonus : site de mint](./documentation/web-site.md) - architecture Next.js/ethers.js

## 🛠️ Stack & outils utilisés

- [Hardhat](https://hardhat.org/) - compilation, déploiement, vérification
- [Ethers.js](https://docs.ethers.org/) - interaction avec la blockchain (scripts et site)
- [Next.js](https://nextjs.org/) - site de mint
- [MetaMask](https://metamask.io/) - wallet
- [Etherscan (Sepolia)](https://sepolia.etherscan.io/) - explorateur, vérification du code source

## ✍️ Auteur

- [@SatoSakii](https://github.com/SatoSakii)

## 📄 License

MIT