// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// @title Base64
// @notice Bibliothèque pour l'encodage Base64
library Base64
{
	// Table de caractères utilisée pour l'encodage Base64
	string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	// Fonction pour encoder des données en Base64
	function encode(bytes memory data) internal pure returns (string memory)
	{
		// Si les données sont vides, retourne une chaîne vide
		if (data.length == 0) return "";

		// Calcule la longueur de la chaîne encodée
		// Chaque 3 octets de données sont encodés en 4 caractères Base64
		uint256 encodedLen = 4 * ((data.length + 2) / 3);

		// Crée un tableau de bytes pour stocker le résultat encodé
		bytes memory result = new bytes(encodedLen);

		uint256 i = 0;
		uint256 j = 0;

		while (i < data.length)
		{
			// Lis 3 octets de données, si moins de 3 octets restent
			// les octets manquants sont considérés comme des zéros
			uint256 octet1 = uint8(data[i + 0]);
			uint256 octet2 = (i + 1 < data.length ? uint8(data[i + 1]) : 0);
			uint256 octet3 = (i + 2 < data.length ? uint8(data[i + 2]) : 0);

			// Combine les 3 octets en un seul entier de 24 bits
			uint256 combined = (octet1 << 16) | (octet2 << 8) | octet3;

			// Encode les 4 caractères Base64 à partir des 24 bits combinés
			result[j + 0] = bytes1(bytes(TABLE)[(combined >> 18) & 0x3F]);
			result[j + 1] = bytes1(bytes(TABLE)[(combined >> 12) & 0x3F]);

			// Si moins de 2 octets restent, le troisième caractère est remplacé par '='
			result[j + 2] = (i + 1 < data.length) ? bytes1(bytes(TABLE)[(combined >> 6) & 0x3F]) : bytes1("=");
			result[j + 3] = (i + 2 < data.length) ? bytes1(bytes(TABLE)[combined & 0x3F]) : bytes1("=");

			i += 3;
			j += 4;
		}
		return string(result);
	}

}