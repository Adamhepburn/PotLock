// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokerEscrow is Ownable {
    // USDC token interface
    IERC20 public usdc;
    
    struct Game {
        string name;
        uint256 buyInAmount;
        address banker;
        bool active;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
    }
    
    struct Player {
        address wallet;
        uint256 buyIn;
        uint256 chipCount;
        bool hasDeposited;
        bool hasCashedOut;
    }
    
    struct CashOutRequest {
        address player;
        uint256 chipCount;
        mapping(address => bool) approvals;
        mapping(address => bool) disputes;
        uint256 approvalCount;
        uint256 disputeCount;
        bool resolved;
    }
    
    // Game storage
    mapping(string => Game) public games;
    
    // Player storage per game
    mapping(string => mapping(address => Player)) public players;
    
    // List of players in each game
    mapping(string => address[]) public playerAddresses;
    
    // Cash out requests per game per player
    mapping(string => mapping(address => CashOutRequest)) public cashOutRequests;
    
    // Events
    event GameCreated(string gameId, string name, uint256 buyInAmount, address banker);
    event PlayerJoined(string gameId, address player, uint256 buyIn);
    event FundsDeposited(string gameId, address player, uint256 amount);
    event CashOutRequested(string gameId, address player, uint256 chipCount);
    event CashOutApproved(string gameId, address player, address approver);
    event CashOutDisputed(string gameId, address player, address disputer);
    event FundsWithdrawn(string gameId, address player, uint256 amount);
    event GameEnded(string gameId);
    
    constructor(address _usdcAddress) {
        usdc = IERC20(_usdcAddress);
    }
    
    // Create a new game
    function createGame(string memory gameId, string memory name, uint256 buyInAmount, address banker) external {
        require(games[gameId].banker == address(0), "Game ID already exists");
        
        games[gameId] = Game({
            name: name,
            buyInAmount: buyInAmount,
            banker: banker,
            active: true,
            totalDeposited: 0,
            totalWithdrawn: 0
        });
        
        emit GameCreated(gameId, name, buyInAmount, banker);
    }
    
    // Join a game
    function joinGame(string memory gameId) external {
        Game storage game = games[gameId];
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(players[gameId][msg.sender].wallet == address(0), "Player already joined");
        
        players[gameId][msg.sender] = Player({
            wallet: msg.sender,
            buyIn: game.buyInAmount,
            chipCount: 0,
            hasDeposited: false,
            hasCashedOut: false
        });
        
        playerAddresses[gameId].push(msg.sender);
        
        emit PlayerJoined(gameId, msg.sender, game.buyInAmount);
    }
    
    // Deposit funds into escrow
    function depositFunds(string memory gameId) external {
        Game storage game = games[gameId];
        Player storage player = players[gameId][msg.sender];
        
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(player.wallet != address(0), "Player has not joined the game");
        require(!player.hasDeposited, "Player has already deposited");
        
        // Transfer USDC from player to contract
        require(usdc.transferFrom(msg.sender, address(this), player.buyIn), "USDC transfer failed");
        
        player.hasDeposited = true;
        game.totalDeposited += player.buyIn;
        
        emit FundsDeposited(gameId, msg.sender, player.buyIn);
    }
    
    // Submit chip count for cash out
    function submitChipCount(string memory gameId, uint256 chipCount) external {
        Game storage game = games[gameId];
        Player storage player = players[gameId][msg.sender];
        
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(player.wallet != address(0), "Player has not joined the game");
        require(player.hasDeposited, "Player has not deposited funds");
        require(!player.hasCashedOut, "Player has already cashed out");
        require(cashOutRequests[gameId][msg.sender].player == address(0), "Cash out request already exists");
        
        // Create cash out request
        CashOutRequest storage request = cashOutRequests[gameId][msg.sender];
        request.player = msg.sender;
        request.chipCount = chipCount;
        request.approvalCount = 0;
        request.disputeCount = 0;
        request.resolved = false;
        
        emit CashOutRequested(gameId, msg.sender, chipCount);
    }
    
    // Approve a cash out request
    function approveCashOut(string memory gameId, address playerAddress) external {
        Game storage game = games[gameId];
        Player storage requester = players[gameId][playerAddress];
        Player storage approver = players[gameId][msg.sender];
        CashOutRequest storage request = cashOutRequests[gameId][playerAddress];
        
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(requester.wallet != address(0), "Player has not joined the game");
        require(approver.wallet != address(0) || msg.sender == game.banker, "Not authorized to approve");
        require(request.player != address(0), "No cash out request exists");
        require(!request.resolved, "Request already resolved");
        require(!request.approvals[msg.sender], "Already approved");
        require(!request.disputes[msg.sender], "Already disputed");
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
        
        emit CashOutApproved(gameId, playerAddress, msg.sender);
        
        // Check if all players and banker have approved
        uint256 playerCount = playerAddresses[gameId].length;
        bool bankerApproved = (game.banker == address(0) || request.approvals[game.banker]);
        
        // If everyone has approved, process payout
        if (bankerApproved && request.approvalCount >= playerCount - 1) {
            processPayout(gameId, playerAddress);
        }
    }
    
    // Dispute a cash out request
    function disputeCashOut(string memory gameId, address playerAddress) external {
        Game storage game = games[gameId];
        Player storage requester = players[gameId][playerAddress];
        Player storage disputer = players[gameId][msg.sender];
        CashOutRequest storage request = cashOutRequests[gameId][playerAddress];
        
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(requester.wallet != address(0), "Player has not joined the game");
        require(disputer.wallet != address(0) || msg.sender == game.banker, "Not authorized to dispute");
        require(request.player != address(0), "No cash out request exists");
        require(!request.resolved, "Request already resolved");
        require(!request.approvals[msg.sender], "Already approved");
        require(!request.disputes[msg.sender], "Already disputed");
        
        request.disputes[msg.sender] = true;
        request.disputeCount++;
        
        emit CashOutDisputed(gameId, playerAddress, msg.sender);
    }
    
    // Process payout for an approved cash out request
    function processPayout(string memory gameId, address playerAddress) internal {
        Game storage game = games[gameId];
        Player storage player = players[gameId][playerAddress];
        CashOutRequest storage request = cashOutRequests[gameId][playerAddress];
        
        require(!request.resolved, "Request already resolved");
        require(player.hasDeposited, "Player has not deposited funds");
        require(!player.hasCashedOut, "Player has already cashed out");
        
        // Calculate the player's share of the pot
        uint256 totalChips = request.chipCount;
        uint256 payout = (request.chipCount * game.totalDeposited) / totalChips;
        
        // Cap payout at the total deposited amount
        if (payout > game.totalDeposited - game.totalWithdrawn) {
            payout = game.totalDeposited - game.totalWithdrawn;
        }
        
        // Update player state
        player.chipCount = request.chipCount;
        player.hasCashedOut = true;
        request.resolved = true;
        
        // Update game state
        game.totalWithdrawn += payout;
        
        // Transfer funds
        require(usdc.transfer(playerAddress, payout), "USDC transfer failed");
        
        emit FundsWithdrawn(gameId, playerAddress, payout);
    }
    
    // Force end game and distribute remaining funds (only banker or owner)
    function endGame(string memory gameId) external {
        Game storage game = games[gameId];
        
        require(game.banker != address(0), "Game does not exist");
        require(game.active, "Game is not active");
        require(msg.sender == game.banker || msg.sender == owner(), "Not authorized");
        
        // Mark game as inactive
        game.active = false;
        
        // Calculate total chips in play
        uint256 totalChips = 0;
        for (uint256 i = 0; i < playerAddresses[gameId].length; i++) {
            address playerAddress = playerAddresses[gameId][i];
            Player storage player = players[gameId][playerAddress];
            
            // Only consider players who have deposited and not cashed out
            if (player.hasDeposited && !player.hasCashedOut) {
                // Use chip count if available, otherwise use buy-in as fallback
                uint256 chips = player.chipCount > 0 ? player.chipCount : player.buyIn;
                totalChips += chips;
            }
        }
        
        // Distribute funds to players who haven't cashed out
        for (uint256 i = 0; i < playerAddresses[gameId].length; i++) {
            address playerAddress = playerAddresses[gameId][i];
            Player storage player = players[gameId][playerAddress];
            
            if (player.hasDeposited && !player.hasCashedOut) {
                uint256 chips = player.chipCount > 0 ? player.chipCount : player.buyIn;
                uint256 payout = (chips * (game.totalDeposited - game.totalWithdrawn)) / totalChips;
                
                player.hasCashedOut = true;
                game.totalWithdrawn += payout;
                
                require(usdc.transfer(playerAddress, payout), "USDC transfer failed");
                emit FundsWithdrawn(gameId, playerAddress, payout);
            }
        }
        
        emit GameEnded(gameId);
    }
    
    // Get game information
    function getGameInfo(string memory gameId) external view returns (
        string memory name,
        uint256 buyInAmount,
        address banker,
        bool active,
        uint256 totalDeposited,
        uint256 totalWithdrawn
    ) {
        Game storage game = games[gameId];
        return (
            game.name,
            game.buyInAmount,
            game.banker,
            game.active,
            game.totalDeposited,
            game.totalWithdrawn
        );
    }
    
    // Get player information
    function getPlayerInfo(string memory gameId, address playerAddress) external view returns (
        address wallet,
        uint256 buyIn,
        uint256 chipCount,
        bool hasDeposited,
        bool hasCashedOut
    ) {
        Player storage player = players[gameId][playerAddress];
        return (
            player.wallet,
            player.buyIn,
            player.chipCount,
            player.hasDeposited,
            player.hasCashedOut
        );
    }
    
    // Get player count in a game
    function getPlayerCount(string memory gameId) external view returns (uint256) {
        return playerAddresses[gameId].length;
    }
    
    // Update USDC token address (only owner)
    function updateUsdcAddress(address _usdcAddress) external onlyOwner {
        usdc = IERC20(_usdcAddress);
    }
    
    // Emergency withdraw (only owner)
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
