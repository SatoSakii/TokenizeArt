# Métadonnées on-chain

Ce document détaille le mécanisme le plus technique du projet : comment `tokenURI` génère l'image et les métadonnées **entièrement à l'intérieur du contrat**, sans dépendre d'IPFS ni d'aucun serveur externe.

## Le principe général : Data URI

Une URI classique (`https://exemple.com/metadata/1.json`) pointe vers un fichier hébergé ailleurs - si ce serveur disparaît, le NFT perd ses métadonnées. Une **Data URI** encode la donnée elle-même directement dans la chaîne de caractères, sous la forme :

```
data:<type-mime>;base64,<donnee-encodee>
```

Un navigateur, un wallet, ou une marketplace qui reconnaît ce format peut décoder et afficher le contenu immédiatement, sans requête réseau. C'est ce format que `tokenURI` renvoie, imbriqué sur deux niveaux : une Data URI JSON, qui contient elle-même une Data URI SVG.

## Étape 1 - Les SVG sources

Les 3 designs (`nfts-svg/42-nft-lgbt.svg`, `42-nft-matrix.svg`, `42-nft-gold.svg`) sont dessinés à la main en formes géométriques simples (rectangles, polygones, dégradés) plutôt que tracés automatiquement depuis une photo - voir [technical.md](./technical.md) pour la justification liée à la taille et à la limite de bytecode d'un contrat déployé (24 576 octets, EIP-170).

## Étape 2 - Génération de `SvgAssets.sol`

Solidity ne peut importer que des fichiers `.sol` - impossible de faire `import "./mon-fichier.svg"`. Le script `nfts-svg/scripts/generate-svg-assets.ts` lit les 3 fichiers SVG sources, les minifie (retire les retours à la ligne et espaces superflus), et génère automatiquement `contracts/utils/SvgAssets.sol`, une `library` contenant chaque SVG comme constante `string`. Ce fichier généré ne doit jamais être édité directement - toute modification d'un design passe par le SVG source, suivi d'un nouveau lancement du script.

## Étape 3 - Encodage Base64 (bibliothèque `Base64.sol`)

Solidity ne fournit aucune fonction native d'encodage base64. La bibliothèque `Base64.sol`, écrite à la main, traite les données par groupes de 3 octets (24 bits), qu'elle redécoupe en 4 blocs de 6 bits pour produire 4 caractères base64 - le rapport 3 octets → 4 caractères vient du plus petit commun multiple entre 8 bits (un octet) et 6 bits (la capacité d'un caractère base64, puisque 2⁶ = 64). Un padding (`=`) est ajouté quand la longueur des données n'est pas un multiple exact de 3.

## Étape 4 - Conversion du tokenId en texte

Le nom du NFT (`"ALB42NFT #3"`) nécessite d'insérer le `tokenId`, un `uint256`, dans une chaîne de caractères. La fonction `_toString` convertit l'entier en texte en extrayant ses chiffres un par un (`value % 10`, puis `value /= 10`), en les plaçant directement dans le bon ordre dans un buffer de taille pré-calculée - équivalent du principe d'un `putnbr` écrit en C.

## Étape 5 - Assemblage dans `tokenURI`

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory)
```

## Vérification effectuée

Avant tout déploiement, un script de test local (`code/nft/test.ts`, exécuté sur la blockchain simulée de Hardhat, sans réseau réel) a minté un NFT de chaque style, récupéré `tokenURI`, décodé le JSON et le SVG imbriqué côté script (`Buffer.from(..., 'base64').toString()`), et vérifié que chaque SVG décodé commence bien par `<svg xmlns=...>` - confirmant que l'encodage/décodage fonctionne correctement avant tout coût de déploiement réel sur Sepolia.