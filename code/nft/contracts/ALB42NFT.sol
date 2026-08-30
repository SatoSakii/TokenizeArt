// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "./utils/Base64.sol";
import "./utils/SvgAssets.sol";

interface IERC721Receiver
{
	// Cette fonction est appelée lorsqu'un token ERC721 est transféré à ce contrat.
	// Elle doit retourner une valeur spécifique pour indiquer que le contrat accepte le token.
	function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

// Création d'un token ERC721 simple, ALB42NFT.
contract ALB42NFT
{
	// Nom du token
	string public name = "ALB42NFT";

	// Symbole du token
	string public symbol = "ALB42NFT";

	// Stockage des propriétaires de chaque token
	// chaque token est identifié par un identifiant unique.
	// le keyword mapping est utilisé pour créer une table de hachage qui
	// associe une clé à une valeur.
	mapping(uint256 => address) public ownerOf;

	// Stockage du nombre de tokens possédés par chaque adresse
	mapping(address => uint256) public balanceOf;

	// Stockage de l'identifiant du prochain token à créer
	uint256 public nextTokenId = 1;

	// L'adresse du propriétaire du contrat, qui est l'adresse qui a déployé le contrat.
	address public owner;

	// Stockage du style de chaque token
	mapping(uint256 => uint8) private styleOf; // 0 = "lgbt", 1 = "matrix", 2 = "gold"

	// Les événements sont utilisés pour notifier les clients de l'application
	// des changements d'état du contrat.

	// L'événement Transfer est émis lorsqu'un token est transféré d'une adresse à une autre.
	event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

	constructor()
	{
		owner = msg.sender;
	}

	// Fonction pour récupérer le style d'un token spécifique
	function getStyle(uint256 tokenId) public view returns (uint8)
	{
		// Vérifie que le token existe en s'assurant que l'adresse du propriétaire
		// n'est pas l'adresse zéro
		require(ownerOf[tokenId] != address(0), "Le token n'existe pas.");

		return styleOf[tokenId];
	}

	// Fonction pour générer le SVG correspondant à un style spécifique
	function _svgFor(uint8 style) internal pure returns (string memory)
	{
		if (style == 0)
			return (SvgAssets.LGBT);
		else if (style == 1)
			return (SvgAssets.MATRIX);
		else if (style == 2)
			return (SvgAssets.GOLD);

		revert("Style inconnu");
	}

	// Fonction pour créer un nouveau token et l'attribuer à une adresse spécifique
	function safeMint(address to, uint8 style) public returns (uint256 tokenId)
	{
		// Vérifie que le style est compris entre 0 et 2
		require(style < 3, "Le style doit etre compris entre 0 et 2.");

		// Vérifie que l'adresse qui appelle la fonction est le propriétaire du contrat
		require(msg.sender == owner, "Seul le proprietaire peut creer des tokens.");

		// Vérifie que l'adresse to n'est pas l'adresse zéro
		require(to != address(0), "L'adresse de destination ne peut pas etre l'adresse zero.");

		// Vérifie si l'adresse to est un contrat
		if (to.code.length > 0)
		{
			// Vérifie que l'adresse to est un contrat et qu'il implémente l'interface IERC721Receiver
			require(IERC721Receiver(to).onERC721Received(
				msg.sender, address(0), nextTokenId, "") == IERC721Receiver.onERC721Received.selector,
				"Le contrat destinataire n'accepte pas les tokens ERC721."
			);
		}

		// Crée un nouveau token et l'attribue à l'adresse spécifiée
		// Le style du token est également stocké dans le mapping styleOf.
		tokenId = nextTokenId++;
		ownerOf[tokenId] = to;
		balanceOf[to]++;
		styleOf[tokenId] = style;

		// Envoyer l'information a la blockchain
		emit Transfer(address(0), to, tokenId);

		// Retourne l'identifiant du token nouvellement créé
		// Ce n'est pas obligatoire pour Solidity car
		// la fonction est déclarée pour retourner un uint256
		// donc elle retournera automatiquement la valeur de tokenId.
		return (tokenId);
	}

	function transferFrom(address from, address to, uint256 tokenId) public
	{
		// Vérifie que l'adresse qui appelle la fonction est le propriétaire du token
		require(msg.sender == from, "Seul le proprietaire peut transferer le token.");

		// Vérifie que l'adresse from est bien le propriétaire du token
		require(ownerOf[tokenId] == from, "L'adresse from n'est pas le proprietaire du token.");

		// Transférer le token de l'adresse from à l'adresse to
		ownerOf[tokenId] = to;
		balanceOf[from]--;
		balanceOf[to]++;

		// Envoyer l'information a la blockchain
		emit Transfer(from, to, tokenId);
	}
}