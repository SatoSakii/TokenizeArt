import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

export default defineConfig({
	plugins: [hardhatToolboxMochaEthersPlugin],
	solidity: {
		version: "0.8.34",
	},
	networks: {
		sepolia: {
			type: "http",
			url: configVariable("ETHEREUM_NETWORK_URL"),
			accounts: [configVariable("PRIVATE_KEY")],
		},
	},
	verify: {
		etherscan: {
			apiKey: configVariable("ETHERSCAN_API_KEY"),
		},
	},
});