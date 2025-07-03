const { ethers } = require('ethers');

// All your setup code goes here
const { SEPOLIA_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
const contractABI = [
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'recipient',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'Payout',
		type: 'event',
	},
	{
		inputs: [],
		name: 'lockTime',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'nextAccessTime',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'payoutAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_recipient',
				type: 'address',
			},
		],
		name: 'requestTokens',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		stateMutability: 'payable',
		type: 'receive',
	},
];

const provider = new ethers.JsonRpcProvider(SEPOLIA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const faucetContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

export default async function handler(req, res) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method Not Allowed' });
	}

	const { recipient } = req.body;

	if (!recipient || !ethers.isAddress(recipient)) {
		return res.status(400).json({ error: 'Invalid recipient address.' });
	}

	try {
		const tx = await faucetContract.requestTokens(recipient);
		const receipt = await tx.wait();

		// Use res.status().json() to send the response
		res.status(200).json({
			message: 'Funds sent successfully!',
			txHash: receipt.hash,
		});
	} catch (error) {
		const reason = error.reason || 'An error occurred.';
		res.status(500).json({ error: `Failed to send funds. Reason: ${reason}` });
	}
}
