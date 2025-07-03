const hardhat = require('hardhat');

async function main() {
	const Faucet = await hardhat.ethers.getContractFactory('Faucet');

	// Deploy the contract
	console.log('Deploying Faucet contract...');
	const faucet = await Faucet.deploy();

	// Wait for the deployment to be confirmed
	await faucet.waitForDeployment();

	// Get the contract address
	const contractAddress = await faucet.getAddress();
	console.log(`Faucet deployed to: ${contractAddress}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
