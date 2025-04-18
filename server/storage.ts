import { users, games, players, cashOutRequests, approvals } from "@shared/schema";
import type { User, InsertUser, Game, InsertGame, Player, InsertPlayer, CashOutRequest, InsertCashOutRequest, Approval, InsertApproval } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getGamesByUser(userId: number): Promise<Game[]>;
  updateGameStatus(id: number, status: string): Promise<Game | undefined>;
  
  // Player methods
  addPlayerToGame(player: InsertPlayer): Promise<Player>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUserAndGame(userId: number, gameId: number): Promise<Player | undefined>;
  getPlayersInGame(gameId: number): Promise<Player[]>;
  updatePlayerChipCount(id: number, chipCount: number): Promise<Player | undefined>;
  updatePlayerStatus(id: number, status: string): Promise<Player | undefined>;
  
  // Cash out request methods
  createCashOutRequest(request: InsertCashOutRequest): Promise<CashOutRequest>;
  getCashOutRequest(id: number): Promise<CashOutRequest | undefined>;
  getCashOutRequestsByGame(gameId: number): Promise<CashOutRequest[]>;
  getCashOutRequestsByPlayer(playerId: number): Promise<CashOutRequest[]>;
  updateCashOutRequestStatus(id: number, status: string): Promise<CashOutRequest | undefined>;
  
  // Approval methods
  createApproval(approval: InsertApproval): Promise<Approval>;
  getApproval(id: number): Promise<Approval | undefined>;
  getApprovalsByRequest(requestId: number): Promise<Approval[]>;
  
  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private cashOutRequests: Map<number, CashOutRequest>;
  private approvals: Map<number, Approval>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private playerIdCounter: number;
  private cashOutRequestIdCounter: number;
  private approvalIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.players = new Map();
    this.cashOutRequests = new Map();
    this.approvals = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.playerIdCounter = 1;
    this.cashOutRequestIdCounter = 1;
    this.approvalIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Game methods
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const game: Game = { ...insertGame, id, createdAt: new Date() };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.code.toUpperCase() === code.toUpperCase()
    );
  }

  async getGamesByUser(userId: number): Promise<Game[]> {
    const playerGames = Array.from(this.players.values())
      .filter(player => player.userId === userId)
      .map(player => player.gameId);
    
    return Array.from(this.games.values())
      .filter(game => playerGames.includes(game.id) || game.createdById === userId);
  }

  async updateGameStatus(id: number, status: string): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, status };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  // Player methods
  async addPlayerToGame(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const player: Player = { ...insertPlayer, id, joinedAt: new Date() };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByUserAndGame(userId: number, gameId: number): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.userId === userId && player.gameId === gameId
    );
  }

  async getPlayersInGame(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.gameId === gameId
    );
  }

  async updatePlayerChipCount(id: number, chipCount: number): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, chipCount };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async updatePlayerStatus(id: number, status: string): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, status };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  // Cash out request methods
  async createCashOutRequest(insertRequest: InsertCashOutRequest): Promise<CashOutRequest> {
    const id = this.cashOutRequestIdCounter++;
    const request: CashOutRequest = { ...insertRequest, id, createdAt: new Date() };
    this.cashOutRequests.set(id, request);
    return request;
  }

  async getCashOutRequest(id: number): Promise<CashOutRequest | undefined> {
    return this.cashOutRequests.get(id);
  }

  async getCashOutRequestsByGame(gameId: number): Promise<CashOutRequest[]> {
    return Array.from(this.cashOutRequests.values()).filter(
      (request) => request.gameId === gameId
    );
  }

  async getCashOutRequestsByPlayer(playerId: number): Promise<CashOutRequest[]> {
    return Array.from(this.cashOutRequests.values()).filter(
      (request) => request.playerId === playerId
    );
  }

  async updateCashOutRequestStatus(id: number, status: string): Promise<CashOutRequest | undefined> {
    const request = this.cashOutRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.cashOutRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Approval methods
  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const id = this.approvalIdCounter++;
    const approval: Approval = { ...insertApproval, id, createdAt: new Date() };
    this.approvals.set(id, approval);
    return approval;
  }

  async getApproval(id: number): Promise<Approval | undefined> {
    return this.approvals.get(id);
  }

  async getApprovalsByRequest(requestId: number): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(
      (approval) => approval.requestId === requestId
    );
  }
}

export const storage = new MemStorage();
