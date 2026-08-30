# Fonctionnement du contrat

Le contrat `ALB42NFT.sol` implémente le standard ERC-721 entièrement à la main, avec génération et encodage des métadonnées 100% on-chain. Ce document détaille chaque variable et fonction.

## Fichiers

| Fichier | Rôle |
|---|---|
| `contracts/ALB42NFT.sol` | Contrat principal - logique ERC-721, mint, transferts |
| `contracts/utils/Base64.sol` | Bibliothèque d'encodage base64, écrite à la main |
| `contracts/utils/SvgAssets.sol` | Les 3 designs SVG, générés automatiquement depuis `nfts-svg/` par `scripts/generate-svg-assets.ts` - ne jamais éditer directement |

## Variables d'état

| Variable | Rôle |
|---|---|
| `name` / `symbol` | Nom et symbole de la collection, affichés par MetaMask/Etherscan/OpenSea |
| `ownerOf` | `mapping(uint256 => address)` - le propriétaire de chaque tokenId. C'est la fonction demandée explicitement par le sujet pour "confirmer le propriétaire d'un NFT" |
| `balanceOf` | `mapping(address => uint256)` - combien de NFT possède chaque adresse |
| `nextTokenId` | Compteur du prochain tokenId à attribuer, initialisé à `1` (voir [security.md](./security.md) pour pourquoi pas `0`) |
| `owner` | Adresse ayant le droit de mint - à ne pas confondre avec `ownerOf`, qui répond à "qui possède *ce* NFT précis" |
| `styleOf` | `mapping(uint256 => uint8)` - quel design (0 = LGBT, 1 = Matrix, 2 = Gold) chaque tokenId a reçu au mint |

## Events

- `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)` - émis à chaque mint (`from = address(0)`) et à chaque transfert, convention standard ERC-721 identique à l'ERC-20.

## `safeMint(address to, uint8 style)`

Réservée au `owner` du contrat. Vérifie que `style` est valide (0 à 2), que `to` n'est pas l'adresse zéro, puis :

1. Si `to` est un contrat (détecté via `to.code.length > 0`), appelle `onERC721Received` sur ce contrat et vérifie sa réponse - le mint échoue si le destinataire ne sait pas gérer les NFT. C'est cette vérification qui justifie le préfixe "safe" du nom de la fonction (voir [security.md](./security.md)).
2. Attribue le tokenId courant (`nextTokenId`, puis incrémente), enregistre `ownerOf` et `styleOf`, incrémente `balanceOf`.
3. Émet `Transfer(address(0), to, tokenId)`.

## `transferFrom(address from, address to, uint256 tokenId)`

Vérifie que l'appelant est bien `from` et que `from` est bien le propriétaire actuel du tokenId, puis met à jour `ownerOf` et les deux `balanceOf`. Version simplifiée du standard : pas de mécanisme `approve`/`getApproved` (non nécessaire pour les exigences du sujet, qui ne demande pas de délégation de transfert).

## `getStyle(uint256 tokenId)`

Fonction de confort, renvoie le style (0/1/2) d'un tokenId donné. Vérifie d'abord que le token existe (`ownerOf[tokenId] != address(0)`).

## `tokenURI(uint256 tokenId)`

Le cœur du bonus "stockage on-chain". Détail complet du fonctionnement dans [metadata.md](./metadata.md) - en résumé :

1. Récupère le SVG correspondant au style du token (`_svgFor`)
2. L'encode en base64 (`Base64.encode`)
3. Construit le JSON de métadonnées (`name`, `description`, `image`) en insérant le SVG encodé
4. Encode ce JSON à son tour en base64
5. Renvoie le tout préfixé par `data:application/json;base64,`

## Fonctions internes utilitaires

- `_svgFor(uint8 style)` - renvoie la constante SVG correspondante depuis `SvgAssets`
- `_toString(uint256 value)` - convertit un entier en sa représentation texte, écrite à la main (principe similaire à un `putnbr` en C), utilisée pour insérer le `tokenId` dans le nom du NFT