# Sécurité & privilèges

Comme sur le projet Tokenizer, aucune bibliothèque externe (OpenZeppelin) n'est utilisée - la protection d'accès et la logique ERC-721 sont écrites entièrement à la main.

## Qui est owner ?

Au déploiement, le `constructor` fixe `owner = msg.sender`. Cette adresse est la seule autorisée à mint de nouveaux NFT. Contrairement au token ERC-20 du projet Tokenizer, ce contrat n'implémente pas de `transferOwnership` - un choix assumé, puisque le sujet TokenizeArt ne demande pas de bonus multisig, et qu'introduire cette fonction sans besoin réel aurait ajouté une surface d'attaque inutile.

## Tableau des privilèges

| Fonction | Restriction | Effet |
|---|---|---|
| `transferFrom` | Doit être appelée par le propriétaire actuel du tokenId (`msg.sender == from`) | Transférer un NFT qu'on possède |
| `safeMint(to, style)` | `msg.sender == owner` | Créer un nouveau NFT |
| `tokenURI` / `getStyle` / `ownerOf` / `balanceOf` | Aucune (lecture publique) | Consulter les informations d'un NFT |

Une adresse quelconque ne peut ni créer de NFT, ni transférer un NFT qui ne lui appartient pas.

## Pourquoi `nextTokenId` démarre à 1, pas 0

Un `mapping` non initialisé renvoie toujours sa valeur par défaut plutôt qu'une erreur - pour `mapping(uint256 => address)`, cette valeur par défaut est `address(0)`. Si le premier tokenId minté était `0`, il serait impossible de distinguer "le tokenId 0 existe et n'a pas encore de propriétaire" de "le tokenId 0 n'a jamais été minté". Démarrer à `1` garde `0` comme valeur sentinelle sûre, exploitée par les `require(ownerOf[tokenId] != address(0), ...)` présents dans `getStyle` et `tokenURI`.

## La vérification `safeMint` : pourquoi "safe"

Le nom de la fonction fait référence au mécanisme de sécurité du standard ERC-721 : si le destinataire d'un mint est un smart contract (détecté via `to.code.length > 0`), ce contrat doit explicitement confirmer qu'il sait gérer les NFT, via un appel à `onERC721Received` dont la réponse est vérifiée par un `require`. Sans cette vérification, un NFT envoyé vers un contrat qui n'implémente aucune fonction pour le retransférer resterait **bloqué de façon permanente**, sans qu'aucune action ne puisse jamais le récupérer - un problème documenté historiquement sur des NFT envoyés par erreur vers des adresses de contrats non préparés.

## Comportement en cas de mauvais usage

- `safeMint` appelé par une adresse qui n'est pas `owner` → revert `"Seul le proprietaire peut creer des tokens."`
- `safeMint` avec un style invalide (`>= 3`) → revert `"Le style doit etre compris entre 0 et 2."`
- `safeMint` vers `address(0)` → revert `"L'adresse de destination ne peut pas etre l'adresse zero."`
- `safeMint` vers un contrat qui ne répond pas correctement à `onERC721Received` → revert `"Le contrat destinataire n'accepte pas les tokens ERC721."`
- `transferFrom` appelé par quelqu'un d'autre que le propriétaire → revert `"Seul le proprietaire peut transferer le token."`
- `tokenURI` / `getStyle` sur un tokenId inexistant → revert `"Le token n'existe pas."`

## Limites assumées

- Pas de mécanisme `approve`/`getApproved` - un tiers ne peut jamais transférer un NFT au nom du propriétaire. Suffisant pour les exigences du sujet, mais un écart volontaire par rapport au standard ERC-721 complet.
- Le site de mint (voir [web-site.md](./web-site.md)) ne fait que refléter cette protection côté interface (masquer le bouton de mint si le wallet connecté n'est pas `owner`) - la vraie sécurité reste entièrement portée par le contrat, jamais par le front-end.
- Contrat non audité, écrit dans un but pédagogique - mêmes réserves que sur le projet Tokenizer.