const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet', function () {
	async function deployFaucetFixture() {
		const [owner, otherAccount] = await ethers.getSigners();
		const PayoutAmount = ethers.parseEther('0.01');
		const LockTime = 24 * 60 * 60;

		const Faucet = await ethers.getContractFactory('Faucet');
		const faucet = await Faucet.deploy();

		return { faucet, owner, otherAccount, PayoutAmount, LockTime };
	}

	describe('Deployment', function () {
		it('Should set the right owner', async function () {
			const { faucet, owner } = await loadFixture(deployFaucetFixture);
			expect(await faucet.owner()).to.equal(owner.address);
		});

		it('Should have the correct payout amount and lock time', async function () {
			const { faucet, PayoutAmount, LockTime } = await loadFixture(deployFaucetFixture);
			expect(await faucet.payoutAmount()).to.equal(PayoutAmount);
			expect(await faucet.lockTime()).to.equal(LockTime);
		});
	});

	describe('Funding and Withdrawals', function () {
		it('Should allow the owner to withdraw all funds', async function () {
			const { faucet, owner } = await loadFixture(deployFaucetFixture);
			const fundAmount = ethers.parseEther('1.0');

			await owner.sendTransaction({
				to: await faucet.getAddress(),
				value: fundAmount,
			});

			expect(await ethers.provider.getBalance(faucet.getAddress())).to.equal(fundAmount);

			await expect(faucet.withdraw()).to.changeEtherBalances([owner, faucet], [fundAmount, -fundAmount]);
		});

		it('Should prevent non-owners from withdrawing funds', async function () {
			const { faucet, otherAccount } = await loadFixture(deployFaucetFixture);
			await expect(faucet.connect(otherAccount).withdraw()).to.be.revertedWith('Only the owner can call this function');
		});

		it('Should receive ETH when sent to the contract address', async function () {
			const { faucet, owner } = await loadFixture(deployFaucetFixture);
			const amount = ethers.parseEther('0.5');
			await expect(async () => owner.sendTransaction({ to: await faucet.getAddress(), value: amount })).to.changeEtherBalance(faucet, amount);
		});
	});

	describe('Token Requests', function () {
		beforeEach(async function () {
			const { faucet, owner, otherAccount, PayoutAmount, LockTime } = await loadFixture(deployFaucetFixture);

			// Attach all variables to the `this` context for use in the tests
			this.faucet = faucet;
			this.owner = owner;
			this.otherAccount = otherAccount;
			this.PayoutAmount = PayoutAmount;
			this.LockTime = LockTime;

			// Fund the faucet before each test in this block
			await this.owner.sendTransaction({
				to: await this.faucet.getAddress(),
				value: ethers.parseEther('1.0'),
			});
		});

		it('Should allow a user to request tokens successfully', async function () {
			await expect(this.faucet.requestTokens(this.otherAccount.address)).to.changeEtherBalances([this.otherAccount, this.faucet], [this.PayoutAmount, -this.PayoutAmount]);
		});

		it('Should set the correct cooldown period for a user after a request', async function () {
			await this.faucet.requestTokens(this.otherAccount.address);

			const block = await ethers.provider.getBlock('latest');
			const expectedNextAccessTime = block.timestamp + this.LockTime;
			const actualNextAccessTime = await this.faucet.nextAccessTime(this.otherAccount.address);

			expect(actualNextAccessTime).to.equal(expectedNextAccessTime);
		});

		it('Should fail if the faucet has insufficient funds', async function () {
			// We still use a fresh, unfunded fixture here because this test needs it.
			const { faucet, otherAccount } = await loadFixture(deployFaucetFixture);
			await expect(faucet.requestTokens(otherAccount.address)).to.be.revertedWith('Faucet balance is too low.');
		});

		it('Should fail if a user requests tokens before the cooldown period is over', async function () {
			// First request is successful on the funded contract
			await this.faucet.requestTokens(this.otherAccount.address);

			// The second request should fail
			await expect(this.faucet.requestTokens(this.otherAccount.address)).to.be.revertedWith('Cooldown not over yet. Please wait.');
		});
	});
});
