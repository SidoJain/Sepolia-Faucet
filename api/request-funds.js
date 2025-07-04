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

// This function formats seconds into a HH:MM:SS string
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Pad with leading zeros if necessary
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { recipient } = req.body;

    if (!recipient || !ethers.isAddress(recipient)) {
        return res.status(400).json({ error: 'Invalid or missing recipient address.' });
    }

    try {
        // First, check if the user is on cooldown without sending a transaction.
        const nextAccessTime = await faucetContract.nextAccessTime(recipient);
        const latestBlock = await provider.getBlock('latest');
        const currentTime = latestBlock.timestamp;

        if (currentTime < nextAccessTime) {
            // User is on cooldown, calculate remaining time.
            const timeLeftInSeconds = Number(nextAccessTime) - currentTime;
            const formattedWaitTime = formatTime(timeLeftInSeconds);
            
            // Error 429: Too Many Requests
            return res.status(429).json({
                error: `Cooldown not over yet.`,
                waitTime: formattedWaitTime
            });
        }

        // If cooldown is over, proceed with the transaction
        const tx = await faucetContract.requestTokens(recipient);
        const receipt = await tx.wait();
        
        res.status(200).json({
            message: 'Success! 0.01 Sepolia ETH has been sent.',
            txHash: receipt.hash
        });

    } catch (error) {
        const reason = error.reason || "An error occurred with the transaction.";
        res.status(500).json({ error: `Failed to send funds. Reason: ${reason}` });
    }
}
