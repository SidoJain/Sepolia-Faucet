# Simple Sepolia Faucet

This is a fully functional testnet faucet for the Sepolia network, built with Solidity and JavaScript. The project demonstrates a full-stack dApp architecture, including a smart contract, a backend server (as a serverless function), and a simple web interface.

The faucet is designed to distribute a small, fixed amount of Sepolia ETH (0.01 ETH) to users, with a 24-hour cooldown period to prevent abuse.

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Deploying the Contract](#deploying-the-contract)
  - [Running Tests](#running-tests)
  - [Running the Project Locally](#running-the-project-locally)
- [Deployment](#deployment)

---

## How It Works

The system consists of three main components:

1.  **Smart Contract (`Faucet.sol`):** A Solidity contract deployed on the Sepolia testnet. It holds the pool of Sepolia ETH, enforces the 24-hour cooldown, and handles the logic for sending funds.
2.  **Serverless Backend (`/api`):** A Node.js serverless function that acts as a secure intermediary. It holds a private key to pay for gas fees on behalf of the users. When it receives a request from the frontend, it calls the `requestTokens` function on the smart contract.
3.  **Frontend (`/public`):** A simple HTML, CSS, and vanilla JavaScript interface that allows users to enter their wallet address and request funds.

This architecture is crucial because users requesting testnet ETH often have none to begin with, meaning they cannot pay for the gas fees to interact with the contract. The backend pays the gas, providing a true faucet experience.

## Tech Stack

-   **Blockchain:** Solidity, Ethereum (Sepolia Testnet)
-   **Smart Contract Development:** Hardhat, Ethers.js
-   **Frontend:** HTML, CSS, Vanilla JavaScript
-   **Backend:** Node.js (as a Serverless Function)
-   **Deployment:** Vercel

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   A wallet like [MetaMask](https://metamask.io/) with some Sepolia ETH for deployment.
-   An [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/) account to get a Sepolia RPC URL.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/SidoJain/sepolia-faucet.git
    cd sepolia-faucet
    ```

2.  **Install the dependencies:**
    ```sh
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```

2.  Open the newly created `.env` file and add your secret credentials:
    ```
    # Your Sepolia RPC URL from Infura or Alchemy
    SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"

    # The private key of the wallet you will use to deploy the contract and pay for gas.
    # IMPORTANT: This wallet must be funded with Sepolia ETH.
    PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"

    # This will be filled in after you deploy the contract.
    CONTRACT_ADDRESS=""
    ```

## Usage

### Deploying the Contract

1.  Run the deployment script, targeting the Sepolia network:
    ```sh
    npx hardhat run scripts/deploy.js --network sepolia
    ```

2.  After a successful deployment, the script will print the new contract address to the console.

3.  **Copy this address** and paste it into your `.env` file for the `CONTRACT_ADDRESS` variable.

4.  **Fund the contract:** Send a desired amount of Sepolia ETH (e.g., 1 ETH) to the newly deployed contract address. This is the pool of funds the faucet will distribute.

### Running Tests

To ensure the smart contract logic is sound, run the automated tests:
```sh
npx hardhat test
```