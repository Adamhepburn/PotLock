import { users, games, players, cashOutRequests, approvals, friendships, gameInvitations, gameReservations } from "@shared/schema";
import type { 
  User, InsertUser, 
  Game, InsertGame, 
  Player, InsertPlayer, 
  CashOutRequest, InsertCashOutRequest, 
  Approval, InsertApproval,
  Friendship, InsertFriendship,
  GameInvitation, InsertGameInvitation,
  GameReservation, InsertGameReservation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
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
  
  // Friend methods
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getFriendship(id: number): Promise<Friendship | undefined>;
  getFriendshipByUsers(userId: number, friendId: number): Promise<Friendship | undefined>;
  getFriendsByUser(userId: number): Promise<Friendship[]>;
  updateFriendshipStatus(id: number, status: string): Promise<Friendship | undefined>;
  
  // Game Invitation methods
  createGameInvitation(invitation: InsertGameInvitation): Promise<GameInvitation>;
  getGameInvitation(id: number): Promise<GameInvitation | undefined>;
  getGameInvitationsByUser(userId: number): Promise<GameInvitation[]>;
  getGameInvitationsByGame(gameId: number): Promise<GameInvitation[]>;
  updateGameInvitationStatus(id: number, status: string): Promise<GameInvitation | undefined>;
  
  // Game Reservation methods
  createGameReservation(reservation: InsertGameReservation): Promise<GameReservation>;
  getGameReservation(id: number): Promise<GameReservation | undefined>;
  getGameReservationByUserAndGame(userId: number, gameId: number): Promise<GameReservation | undefined>;
  getGameReservationsByGame(gameId: number): Promise<GameReservation[]>;
  updateGameReservationStatus(id: number, status: string): Promise<GameReservation | undefined>;
  
  // Session storage
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private cashOutRequests: Map<number, CashOutRequest>;
  private approvals: Map<number, Approval>;
  private friendships: Map<number, Friendship>;
  private gameInvitations: Map<number, GameInvitation>;
  private gameReservations: Map<number, GameReservation>;
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private playerIdCounter: number;
  private cashOutRequestIdCounter: number;
  private approvalIdCounter: number;
  private friendshipIdCounter: number;
  private gameInvitationIdCounter: number;
  private gameReservationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.players = new Map();
    this.cashOutRequests = new Map();
    this.approvals = new Map();
    this.friendships = new Map();
    this.gameInvitations = new Map();
    this.gameReservations = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.playerIdCounter = 1;
    this.cashOutRequestIdCounter = 1;
    this.approvalIdCounter = 1;
    this.friendshipIdCounter = 1;
    this.gameInvitationIdCounter = 1;
    this.gameReservationIdCounter = 1;
    
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

  // User update method
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Friend methods
  async createFriendship(insertFriendship: InsertFriendship): Promise<Friendship> {
    const id = this.friendshipIdCounter++;
    const friendship: Friendship = { ...insertFriendship, id, createdAt: new Date() };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getFriendship(id: number): Promise<Friendship | undefined> {
    return this.friendships.get(id);
  }

  async getFriendshipByUsers(userId: number, friendId: number): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values()).find(
      (friendship) => 
        (friendship.userId === userId && friendship.friendId === friendId) ||
        (friendship.userId === friendId && friendship.friendId === userId)
    );
  }

  async getFriendsByUser(userId: number): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      (friendship) => 
        (friendship.userId === userId || friendship.friendId === userId) &&
        friendship.status === 'accepted'
    );
  }

  async updateFriendshipStatus(id: number, status: string): Promise<Friendship | undefined> {
    const friendship = this.friendships.get(id);
    if (!friendship) return undefined;
    
    const updatedFriendship = { ...friendship, status };
    this.friendships.set(id, updatedFriendship);
    return updatedFriendship;
  }

  // Game Invitation methods
  async createGameInvitation(insertInvitation: InsertGameInvitation): Promise<GameInvitation> {
    const id = this.gameInvitationIdCounter++;
    const invitation: GameInvitation = { ...insertInvitation, id, createdAt: new Date() };
    this.gameInvitations.set(id, invitation);
    return invitation;
  }

  async getGameInvitation(id: number): Promise<GameInvitation | undefined> {
    return this.gameInvitations.get(id);
  }

  async getGameInvitationsByUser(userId: number): Promise<GameInvitation[]> {
    return Array.from(this.gameInvitations.values()).filter(
      (invitation) => invitation.inviteeId === userId
    );
  }

  async getGameInvitationsByGame(gameId: number): Promise<GameInvitation[]> {
    return Array.from(this.gameInvitations.values()).filter(
      (invitation) => invitation.gameId === gameId
    );
  }

  async updateGameInvitationStatus(id: number, status: string): Promise<GameInvitation | undefined> {
    const invitation = this.gameInvitations.get(id);
    if (!invitation) return undefined;
    
    const updatedInvitation = { ...invitation, status };
    this.gameInvitations.set(id, updatedInvitation);
    return updatedInvitation;
  }

  // Game Reservation methods
  async createGameReservation(insertReservation: InsertGameReservation): Promise<GameReservation> {
    const id = this.gameReservationIdCounter++;
    const reservation: GameReservation = { ...insertReservation, id, createdAt: new Date() };
    this.gameReservations.set(id, reservation);
    return reservation;
  }

  async getGameReservation(id: number): Promise<GameReservation | undefined> {
    return this.gameReservations.get(id);
  }

  async getGameReservationByUserAndGame(userId: number, gameId: number): Promise<GameReservation | undefined> {
    return Array.from(this.gameReservations.values()).find(
      (reservation) => reservation.userId === userId && reservation.gameId === gameId
    );
  }

  async getGameReservationsByGame(gameId: number): Promise<GameReservation[]> {
    return Array.from(this.gameReservations.values()).filter(
      (reservation) => reservation.gameId === gameId
    );
  }

  async updateGameReservationStatus(id: number, status: string): Promise<GameReservation | undefined> {
    const reservation = this.gameReservations.get(id);
    if (!reservation) return undefined;
    
    const updatedReservation = { ...reservation, status };
    this.gameReservations.set(id, updatedReservation);
    return updatedReservation;
  }
}

export const storage = new MemStorage();
