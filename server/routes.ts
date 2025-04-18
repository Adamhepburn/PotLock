import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertGameSchema, insertPlayerSchema, insertCashOutRequestSchema, insertApprovalSchema } from "@shared/schema";
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

  // Helper functions
  function generateGameCode() {
    // Generate a random 6-character uppercase alphanumeric code
    return nanoid(6).toUpperCase();
  }

  const httpServer = createServer(app);
  return httpServer;
}
