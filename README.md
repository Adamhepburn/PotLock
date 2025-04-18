# PokerEscrow - Blockchain Poker Game Escrow

PokerEscrow is a mobile-friendly web application designed to simplify poker game payouts using blockchain technology. The app allows players to deposit funds into a blockchain escrow account at the start of a poker game, submit their chip count when they want to cash out, get approval from other players and a banker, and receive automatic payouts.

## Features

- **User Authentication**: Sign up/login with email or connect with MetaMask wallet
- **Game Management**: Create or join poker games with custom buy-in amounts
- **Blockchain Escrow**: Funds are securely held in a smart contract until approved for withdrawal
- **Cash-Out Process**: Players submit chip counts which require approval from other players
- **Dispute Resolution**: Counter-values can be submitted for disputed cash-out requests
- **Automatic Payouts**: Once approved, funds are automatically distributed to player wallets

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- Web3.js for blockchain interaction

### Backend
- Node.js with Express
- In-memory database (for development, can be replaced with MongoDB)
- Session-based authentication

### Blockchain
- Solidity smart contract (deployed on Base network)
- USDC stablecoin for deposits and withdrawals

## Getting Started

### Prerequisites
- Node.js (v14+)
- MetaMask wallet extension
- Base network configured in MetaMask

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/poker-escrow.git
cd poker-escrow
