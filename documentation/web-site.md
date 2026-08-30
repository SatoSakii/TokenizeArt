# Bonus : site de mint

Un site Next.js permet de visualiser la collection et de minter de nouveaux NFT, sans passer par Etherscan ou un script en ligne de commande.

## Stack

- **Next.js** (App Router) - choisi pour sa légèreté de configuration et parce que c'est une stack déjà maîtrisée
- **ethers.js** - connexion au contrat, identique aux scripts `deployment/` et `mint/`
- **Tailwind CSS** - styles utilitaires, pas de framework de composants lourd
- **Aucune bibliothèque de connexion wallet** (pas de wagmi, RainbowKit) - connexion directe via `window.ethereum` et `ethers.BrowserProvider`, pour comprendre le mécanisme sans l'abstraire

## Fonctionnement

1. **Connexion** : le bouton "Connecter MetaMask" appelle `eth_requestAccounts` via le provider injecté par MetaMask dans `window.ethereum`.
2. **Vérification du rôle** : une fois connecté, le site appelle `owner()` sur le contrat et compare avec l'adresse connectée, pour savoir si le visiteur a le droit de mint.
3. **Affichage de la collection** : le site lit `nextTokenId()` pour connaître le nombre de NFT existants, puis appelle `tokenURI(id)` pour chacun, décode la Data URI base64 côté navigateur (`atob` + `JSON.parse`), et affiche directement l'image (elle-même une Data URI SVG, affichable nativement dans une balise `<img>`).
4. **Mint** : si le wallet connecté est bien `owner`, un sélecteur de style (LGBT/Matrix/Gold) et un bouton "Mint" apparaissent. Le clic envoie une transaction `safeMint(adresseConnectee, styleChoisi)`, attend sa confirmation, puis recharge la collection affichée.

## Pourquoi le bouton de mint n'est visible que pour le owner

Le contrat protège déjà `safeMint` avec `require(msg.sender == owner, ...)` - un visiteur qui ne serait pas owner et cliquerait quand même sur "Mint" verrait sa transaction échouer avec ce message, après avoir payé du gas pour rien (même sur testnet, ça reste une mauvaise expérience). Masquer le bouton côté interface évite cette situation, sans dupliquer la logique de sécurité : le contrat reste la seule source de vérité, l'interface ne fait que refléter ce qu'il autorise.

## Lancer le site en local

```bash
npm run setup
npm run web
```

Puis ouvrir `http://localhost:3000`, avec MetaMask configuré sur le réseau Sepolia.