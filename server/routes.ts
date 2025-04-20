import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertGameSchema, 
  insertPlayerSchema, 
  insertCashOutRequestSchema, 
  insertApprovalSchema,
  insertFriendshipSchema,
  insertGameInvitationSchema,
  insertGameReservationSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/user, /api/logout)
  setupAuth(app);

  // Game routes
  // Create a new game
  app.post("/api/games", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameData = insertGameSchema.parse({
        ...req.body,
        createdById: req.user.id,
        code: generateGameCode()
      });

      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get games for current user
  app.get("/api/games", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const games = await storage.getGamesByUser(req.user.id);
      res.json(games);
    } catch (error) {
      next(error);
    }
  });

  // Get a game by ID
  app.get("/api/games/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json(game);
    } catch (error) {
      next(error);
    }
  });

  // Join a game by code
  app.post("/api/games/join", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { code, walletAddress } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Game code is required" });
      }

      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      const game = await storage.getGameByCode(code);
      if (!game) {
        return res.status(404).json({ message: "Game not found with this code" });
      }

      // Check if player is already in this game
      const existingPlayer = await storage.getPlayerByUserAndGame(req.user.id, game.id);
      if (existingPlayer) {
        return res.status(400).json({ message: "You're already a player in this game" });
      }

      const playerData = insertPlayerSchema.parse({
        gameId: game.id,
        userId: req.user.id,
        walletAddress,
        buyIn: game.buyInAmount,
        status: "active"
      });

      const player = await storage.addPlayerToGame(playerData);
      res.status(201).json({ game, player });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get players in a game
  app.get("/api/games/:id/players", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const players = await storage.getPlayersInGame(gameId);
      
      // Get user information for each player
      const playersWithUserInfo = await Promise.all(
        players.map(async (player) => {
          const user = await storage.getUser(player.userId);
          return {
            ...player,
            username: user?.username || "Unknown",
            email: user?.email || "Unknown"
          };
        })
      );

      res.json(playersWithUserInfo);
    } catch (error) {
      next(error);
    }
  });

  // Cash out routes
  // Submit a cash out request
  app.post("/api/cashout", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId, chipCount } = req.body;
      if (!gameId || !chipCount) {
        return res.status(400).json({ message: "Game ID and chip count are required" });
      }

      // Check if game exists
      const game = await storage.getGame(parseInt(gameId));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if user is a player in this game
      const player = await storage.getPlayerByUserAndGame(req.user.id, parseInt(gameId));
      if (!player) {
        return res.status(403).json({ message: "You're not a player in this game" });
      }

      // Check if player already has a pending cash out request
      const existingRequests = await storage.getCashOutRequestsByPlayer(player.id);
      const pendingRequest = existingRequests.find(req => req.status === "pending");
      if (pendingRequest) {
        return res.status(400).json({ message: "You already have a pending cash out request" });
      }

      // Create cash out request
      const requestData = insertCashOutRequestSchema.parse({
        gameId: parseInt(gameId),
        playerId: player.id,
        chipCount: parseFloat(chipCount),
        status: "pending"
      });

      const request = await storage.createCashOutRequest(requestData);
      
      // Update player status
      await storage.updatePlayerStatus(player.id, "cashing-out");

      res.status(201).json(request);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get pending cash out requests for a game
  app.get("/api/games/:id/cashout-requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if user is a player in this game
      const player = await storage.getPlayerByUserAndGame(req.user.id, gameId);
      if (!player) {
        return res.status(403).json({ message: "You're not a player in this game" });
      }

      const requests = await storage.getCashOutRequestsByGame(gameId);
      
      // Get player information for each request
      const requestsWithInfo = await Promise.all(
        requests.map(async (request) => {
          const player = await storage.getPlayer(request.playerId);
          const user = player ? await storage.getUser(player.userId) : null;
          const approvals = await storage.getApprovalsByRequest(request.id);
          
          return {
            ...request,
            playerUsername: user?.username || "Unknown",
            approvals: approvals.length,
            approved: approvals.filter(a => a.approved).length,
            disputed: approvals.filter(a => !a.approved).length,
            userHasVoted: approvals.some(a => a.approverId === req.user.id)
          };
        })
      );

      res.json(requestsWithInfo);
    } catch (error) {
      next(error);
    }
  });

  // Approval routes
  // Approve or dispute a cash out request
  app.post("/api/approve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { requestId, approved, counterValue } = req.body;
      if (!requestId || approved === undefined) {
        return res.status(400).json({ message: "Request ID and approval status are required" });
      }

      // Check if request exists
      const request = await storage.getCashOutRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: "Cash out request not found" });
      }

      // Check if game exists
      const game = await storage.getGame(request.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if user is a player in this game or the banker
      const player = await storage.getPlayerByUserAndGame(req.user.id, request.gameId);
      const isBanker = game.bankerAddress && req.user.walletAddress === game.bankerAddress;
      
      if (!player && !isBanker) {
        return res.status(403).json({ message: "You're not authorized to approve this request" });
      }

      // Check if user has already voted
      const existingApprovals = await storage.getApprovalsByRequest(parseInt(requestId));
      const hasVoted = existingApprovals.some(a => a.approverId === req.user.id);
      
      if (hasVoted) {
        return res.status(400).json({ message: "You've already voted on this request" });
      }

      // Create approval
      const approvalData = insertApprovalSchema.parse({
        requestId: parseInt(requestId),
        approverId: req.user.id,
        approved: approved,
        counterValue: counterValue ? parseFloat(counterValue) : null
      });

      const approval = await storage.createApproval(approvalData);

      // Check if all players have approved or if there are any disputes
      const updatedApprovals = await storage.getApprovalsByRequest(parseInt(requestId));
      const allPlayers = await storage.getPlayersInGame(request.gameId);
      const activePlayers = allPlayers.filter(p => p.status !== "cashed-out");
      
      // If there are any disputes, mark the request as disputed
      if (updatedApprovals.some(a => !a.approved)) {
        await storage.updateCashOutRequestStatus(request.id, "disputed");
      } 
      // If all active players and banker (if exists) have approved, mark as approved
      else if (
        updatedApprovals.filter(a => a.approved).length >= activePlayers.length &&
        (!game.bankerAddress || updatedApprovals.some(a => a.approverId === req.user.id && a.approved))
      ) {
        await storage.updateCashOutRequestStatus(request.id, "approved");
        
        // Update player status and chip count
        const player = await storage.getPlayer(request.playerId);
        if (player) {
          await storage.updatePlayerStatus(player.id, "cashed-out");
          await storage.updatePlayerChipCount(player.id, request.chipCount);
        }
      }

      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get approvals for a cash out request
  app.get("/api/cashout-requests/:id/approvals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await storage.getCashOutRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Cash out request not found" });
      }

      // Check if user is a player in this game
      const player = await storage.getPlayerByUserAndGame(req.user.id, request.gameId);
      if (!player) {
        return res.status(403).json({ message: "You're not a player in this game" });
      }

      const approvals = await storage.getApprovalsByRequest(requestId);
      
      // Get user information for each approval
      const approvalsWithUserInfo = await Promise.all(
        approvals.map(async (approval) => {
          const user = await storage.getUser(approval.approverId);
          return {
            ...approval,
            username: user?.username || "Unknown",
            email: user?.email || "Unknown"
          };
        })
      );

      res.json(approvalsWithUserInfo);
    } catch (error) {
      next(error);
    }
  });

  // Friend System Routes
  // Send friend request
  app.post("/api/friends/request", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      // Find the user by username
      const friend = await storage.getUserByUsername(username);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }

      // Can't send friend request to yourself
      if (friend.id === req.user.id) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself" });
      }

      // Check if a friendship already exists
      const existingFriendship = await storage.getFriendshipByUsers(req.user.id, friend.id);
      if (existingFriendship) {
        return res.status(400).json({ 
          message: "Friend request already exists", 
          status: existingFriendship.status 
        });
      }

      // Create friendship record
      const friendshipData = insertFriendshipSchema.parse({
        userId: req.user.id,
        friendId: friend.id,
        status: "pending"
      });

      const friendship = await storage.createFriendship(friendshipData);
      res.status(201).json(friendship);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get friend requests
  app.get("/api/friends/requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get all pending requests where I'm the friend
      const pendingRequests = Array.from(await storage.getFriendsByUser(req.user.id))
        .filter(friendship => 
          friendship.status === "pending" && friendship.friendId === req.user.id
        );

      // Get user info for each friendship
      const requestsWithUserInfo = await Promise.all(
        pendingRequests.map(async (request) => {
          const user = await storage.getUser(request.userId);
          return {
            ...request,
            username: user?.username || "Unknown",
            displayName: user?.displayName || user?.username || "Unknown",
            profileImage: user?.profileImage || null
          };
        })
      );

      res.json(requestsWithUserInfo);
    } catch (error) {
      next(error);
    }
  });

  // Respond to a friend request
  app.post("/api/friends/respond", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { friendshipId, accept } = req.body;
      if (!friendshipId || accept === undefined) {
        return res.status(400).json({ message: "Friendship ID and response are required" });
      }

      // Find the friendship
      const friendship = await storage.getFriendship(parseInt(friendshipId));
      if (!friendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      // Verify the friendship involves the current user
      if (friendship.friendId !== req.user.id) {
        return res.status(403).json({ message: "You cannot respond to this friend request" });
      }

      // Update friendship status
      const status = accept ? "accepted" : "rejected";
      const updatedFriendship = await storage.updateFriendshipStatus(friendship.id, status);
      res.json(updatedFriendship);
    } catch (error) {
      next(error);
    }
  });

  // Get all friends
  app.get("/api/friends", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get all accepted friendships
      const friendships = await storage.getFriendsByUser(req.user.id);

      // Get user info for each friendship
      const friendsWithInfo = await Promise.all(
        friendships.map(async (friendship) => {
          // Determine which user ID is the friend (not the current user)
          const friendId = friendship.userId === req.user.id ? 
            friendship.friendId : friendship.userId;
          
          const user = await storage.getUser(friendId);
          return {
            id: friendship.id,
            user: {
              id: user?.id,
              username: user?.username || "Unknown",
              displayName: user?.displayName || user?.username || "Unknown",
              profileImage: user?.profileImage || null
            },
            createdAt: friendship.createdAt
          };
        })
      );

      res.json(friendsWithInfo);
    } catch (error) {
      next(error);
    }
  });

  // Game Invitation Routes
  // Invite a friend to a game
  app.post("/api/games/:id/invite", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      const { friendId } = req.body;
      if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
      }

      // Find the game
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if the user is associated with the game
      const isCreator = game.createdById === req.user.id;
      const isPlayer = await storage.getPlayerByUserAndGame(req.user.id, gameId);
      
      if (!isCreator && !isPlayer) {
        return res.status(403).json({ message: "You're not associated with this game" });
      }

      // Find the friend
      const friend = await storage.getUser(parseInt(friendId));
      if (!friend) {
        return res.status(404).json({ message: "Friend not found" });
      }

      // Check if there's an existing friendship
      const friendship = await storage.getFriendshipByUsers(req.user.id, friend.id);
      if (!friendship || friendship.status !== "accepted") {
        return res.status(403).json({ message: "You can only invite friends to games" });
      }

      // Check if there's an existing invitation
      const invitations = await storage.getGameInvitationsByGame(gameId);
      const existingInvite = invitations.find(
        inv => inv.inviterId === req.user.id && inv.inviteeId === friend.id && inv.status === "pending"
      );
      
      if (existingInvite) {
        return res.status(400).json({ message: "Invitation already sent" });
      }

      // Create a new invitation
      const invitationData = insertGameInvitationSchema.parse({
        gameId,
        inviterId: req.user.id,
        inviteeId: friend.id,
        status: "pending"
      });

      const invitation = await storage.createGameInvitation(invitationData);
      res.status(201).json(invitation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get game invitations for the current user
  app.get("/api/invitations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const invitations = await storage.getGameInvitationsByUser(req.user.id);
      
      // Get additional info for each invitation
      const invitationsWithInfo = await Promise.all(
        invitations.map(async (invitation) => {
          const game = await storage.getGame(invitation.gameId);
          const inviter = await storage.getUser(invitation.inviterId);
          
          return {
            ...invitation,
            game: {
              name: game?.name || "Unknown Game",
              buyInAmount: game?.buyInAmount || "0",
              code: game?.code || "",
              createdAt: game?.createdAt || new Date()
            },
            inviter: {
              username: inviter?.username || "Unknown",
              displayName: inviter?.displayName || inviter?.username || "Unknown",
              profileImage: inviter?.profileImage || null
            }
          };
        })
      );

      res.json(invitationsWithInfo);
    } catch (error) {
      next(error);
    }
  });

  // Respond to a game invitation
  app.post("/api/invitations/:id/respond", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const invitationId = parseInt(req.params.id);
      if (isNaN(invitationId)) {
        return res.status(400).json({ message: "Invalid invitation ID" });
      }

      const { accept } = req.body;
      if (accept === undefined) {
        return res.status(400).json({ message: "Response is required" });
      }

      // Find the invitation
      const invitation = await storage.getGameInvitation(invitationId);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Verify the invitation is for the current user
      if (invitation.inviteeId !== req.user.id) {
        return res.status(403).json({ message: "You cannot respond to this invitation" });
      }

      // Update invitation status
      const status = accept ? "accepted" : "declined";
      const updatedInvitation = await storage.updateGameInvitationStatus(invitation.id, status);
      
      // If accepted, create a reservation
      if (accept) {
        const game = await storage.getGame(invitation.gameId);
        if (game) {
          // Check if there's already a reservation
          const existingReservation = await storage.getGameReservationByUserAndGame(
            req.user.id, invitation.gameId
          );
          
          if (!existingReservation) {
            // Create a reservation
            const reservationData = insertGameReservationSchema.parse({
              gameId: invitation.gameId,
              userId: req.user.id,
              depositAmount: "0", // No deposit initially
              status: "pending"
            });
            
            await storage.createGameReservation(reservationData);
          }
        }
      }
      
      res.json(updatedInvitation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Game Reservations
  // Make a deposit to reserve a spot
  app.post("/api/games/:id/reserve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      const { depositAmount, transactionHash } = req.body;
      if (!depositAmount || !transactionHash) {
        return res.status(400).json({ message: "Deposit amount and transaction hash are required" });
      }

      // Find the game
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if there's an existing reservation
      const existingReservation = await storage.getGameReservationByUserAndGame(req.user.id, gameId);
      
      if (existingReservation && existingReservation.status === "confirmed") {
        return res.status(400).json({ message: "You already have a confirmed reservation" });
      }

      let reservation;
      if (existingReservation) {
        // Update the existing reservation
        reservation = await storage.updateGameReservationStatus(existingReservation.id, "confirmed");
        
        // Update the deposit amount and transaction hash
        // Note: This is a simplified approach; in a real app you would verify the transaction on the blockchain
        reservation = {
          ...reservation,
          depositAmount,
          transactionHash
        };
      } else {
        // Create a new reservation
        const reservationData = insertGameReservationSchema.parse({
          gameId,
          userId: req.user.id,
          depositAmount,
          transactionHash,
          status: "confirmed"
        });
        
        reservation = await storage.createGameReservation(reservationData);
      }
      
      res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Get reservations for a game
  app.get("/api/games/:id/reservations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }

      // Find the game
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Check if the user is associated with the game
      const isCreator = game.createdById === req.user.id;
      const isPlayer = await storage.getPlayerByUserAndGame(req.user.id, gameId);
      
      if (!isCreator && !isPlayer) {
        return res.status(403).json({ message: "You're not associated with this game" });
      }

      const reservations = await storage.getGameReservationsByGame(gameId);
      
      // Get user info for each reservation
      const reservationsWithInfo = await Promise.all(
        reservations.map(async (reservation) => {
          const user = await storage.getUser(reservation.userId);
          
          return {
            ...reservation,
            user: {
              username: user?.username || "Unknown",
              displayName: user?.displayName || user?.username || "Unknown",
              profileImage: user?.profileImage || null
            }
          };
        })
      );
      
      res.json(reservationsWithInfo);
    } catch (error) {
      next(error);
    }
  });

  // Helper functions
  function generateGameCode() {
    // Generate a random 6-character uppercase alphanumeric code
    return nanoid(6).toUpperCase();
  }

  // Add a simple test route that doesn't require any authentication
  app.get("/api/test", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Add a simple HTML route for testing
  app.get("/test-page", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Test Page</title>
        </head>
        <body>
          <h1>Server is Running</h1>
          <p>If you can see this message, the server is running correctly.</p>
        </body>
      </html>
    `);
  });

  // Plaid API Routes
  app.post("/api/plaid/link-token", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const plaidService = require('./plaid');
      const linkToken = await plaidService.createLinkToken(req.user.id.toString());
      res.json(linkToken);
    } catch (error) {
      console.error("Error creating link token:", error);
      res.status(500).json({ message: "Failed to create link token" });
    }
  });

  app.post("/api/plaid/exchange", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { publicToken } = req.body;
      if (!publicToken) {
        return res.status(400).json({ message: "Public token is required" });
      }
      
      const plaidService = require('./plaid');
      const exchangeResponse = await plaidService.exchangePublicToken(publicToken);
      
      // In a real app, you would store this access token with the user in your database
      // For now, we just return it (not secure for production)
      res.json({ 
        accessToken: exchangeResponse.access_token,
        itemId: exchangeResponse.item_id
      });
    } catch (error) {
      console.error("Error exchanging public token:", error);
      res.status(500).json({ message: "Failed to exchange public token" });
    }
  });

  app.post("/api/plaid/auth", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ message: "Access token is required" });
      }
      
      const plaidService = require('./plaid');
      const authResponse = await plaidService.getBankAccounts(accessToken);
      res.json(authResponse);
    } catch (error) {
      console.error("Error getting bank accounts:", error);
      res.status(500).json({ message: "Failed to get bank accounts" });
    }
  });

  app.post("/api/plaid/transfer", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { accessToken, accountId, amount } = req.body;
      
      if (!accessToken || !accountId || !amount) {
        return res.status(400).json({ 
          message: "Access token, account ID, and amount are required" 
        });
      }
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const plaidService = require('./plaid');
      const transferResponse = await plaidService.initiateTransfer(
        accessToken, 
        accountId, 
        amount, 
        req.user.walletAddress || ''
      );
      
      res.json(transferResponse);
    } catch (error) {
      console.error("Error initiating transfer:", error);
      res.status(500).json({ message: "Failed to initiate transfer" });
    }
  });

  // Coinbase API Routes
  app.post("/api/coinbase/buy", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { amount, paymentMethod } = req.body;
      
      if (!amount || !paymentMethod) {
        return res.status(400).json({ 
          message: "Amount and payment method are required" 
        });
      }
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const coinbaseService = require('./coinbase');
      
      // Buy USDC using Coinbase API
      const buyResponse = await coinbaseService.buyUSDC(amount, paymentMethod);
      
      // Transfer USDC to PotLock contract
      const transferResponse = await coinbaseService.transferToPotLock(
        amount, 
        req.user.walletAddress || ''
      );
      
      res.json({
        success: true,
        buyResponse,
        transferResponse
      });
    } catch (error) {
      console.error("Error buying USDC:", error);
      res.status(500).json({ message: "Failed to buy USDC" });
    }
  });

  app.post("/api/coinbase/sell", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { amount, paymentMethod } = req.body;
      
      if (!amount || !paymentMethod) {
        return res.status(400).json({ 
          message: "Amount and payment method are required" 
        });
      }
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const coinbaseService = require('./coinbase');
      // Sell USDC using Coinbase API
      const sellResponse = await coinbaseService.sellUSDC(amount, paymentMethod);
      
      res.json({
        success: true,
        sellResponse
      });
    } catch (error) {
      console.error("Error selling USDC:", error);
      res.status(500).json({ message: "Failed to sell USDC" });
    }
  });

  app.get("/api/coinbase/payment-methods", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const coinbaseService = require('./coinbase');
      const paymentMethods = await coinbaseService.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error getting payment methods:", error);
      res.status(500).json({ message: "Failed to get payment methods" });
    }
  });

  // PotLock Contract Routes
  app.get("/api/balances", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.user.walletAddress) {
        return res.status(400).json({ message: "Wallet address is not configured for your account" });
      }
      
      const potlockContract = require('./potlock-contract');
      const balances = await potlockContract.getUserBalances(req.user.walletAddress);
      res.json(balances);
    } catch (error) {
      console.error("Error getting user balances:", error);
      res.status(500).json({ message: "Failed to get user balances" });
    }
  });

  app.post("/api/deposit", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      if (!req.user.walletAddress) {
        return res.status(400).json({ message: "Wallet address is not configured for your account" });
      }
      
      const potlockContract = require('./potlock-contract');
      const depositResponse = await potlockContract.depositForUser(req.user.walletAddress, amount);
      res.json(depositResponse);
    } catch (error) {
      console.error("Error depositing to contract:", error);
      res.status(500).json({ message: "Failed to deposit to contract" });
    }
  });

  app.post("/api/withdraw", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { amount, destinationAddress } = req.body;
      
      if (!amount || !destinationAddress) {
        return res.status(400).json({ 
          message: "Amount and destination address are required" 
        });
      }
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      if (!req.user.walletAddress) {
        return res.status(400).json({ message: "Wallet address is not configured for your account" });
      }
      
      const potlockContract = require('./potlock-contract');
      const withdrawResponse = await potlockContract.withdrawForUser(
        req.user.walletAddress, 
        amount, 
        destinationAddress
      );
      
      res.json(withdrawResponse);
    } catch (error) {
      console.error("Error withdrawing from contract:", error);
      res.status(500).json({ message: "Failed to withdraw from contract" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
