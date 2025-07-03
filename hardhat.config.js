// hardhat.config.js

require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { SEPOLIA_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.20',
	networks: {
		sepolia: {
			url: SEPOLIA_URL || '',
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
		},
	},
};
