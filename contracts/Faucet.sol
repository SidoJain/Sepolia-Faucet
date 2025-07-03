// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract Faucet {
    // The address of the owner who deployed the contract
    address public owner;

    // The amount of ETH to send in each transaction (0.01 ETH)
    uint256 public payoutAmount = 0.01 ether;

    // The cooldown period for each address (24 hours)
    uint256 public lockTime = 24 hours;

    // A mapping to store when an address can next request funds
    // mapping(address => next_available_timestamp)
    mapping(address => uint256) public nextAccessTime;

    // Event to log when funds are sent
    event Payout(address indexed recipient, uint256 amount);

    // Modifier to restrict certain functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        // Set the deployer of the contract as the owner
        owner = msg.sender;
    }

    // The main function for a user to request tokens
    function requestTokens(address _recipient) public {
        // Check if the recipient address is valid
        require(_recipient != address(0), "Invalid recipient address.");
        
        // Check if the cooldown period has passed for this recipient
        require(block.timestamp >= nextAccessTime[_recipient], "Cooldown not over yet. Please wait.");

        // Check if the contract has enough balance to send the funds
        require(address(this).balance >= payoutAmount, "Faucet balance is too low.");

        // Update the next access time for the recipient
        nextAccessTime[_recipient] = block.timestamp + lockTime;

        // Send the ETH to the recipient
        payable(_recipient).transfer(payoutAmount);

        // Emit an event to log the transaction
        emit Payout(_recipient, payoutAmount);
    }

    // Function to allow the owner to withdraw all remaining funds
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Function to allow the contract to receive ETH
    receive() external payable {}
}