import type { PrismaClient, User } from '@prisma/client';
import { HashUtils } from '../utils/hash.js';
import { JWTUtils } from '../utils/jwt.js';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  RefreshResponse,
  User as UserType
} from '../types/index.js';
import config from '../utils/config.js';

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new user account
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await HashUtils.hashPassword(data.password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: passwordHash,
        name: data.name || null
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.toUserResponse(user)
    };
  }

  /**
   * Authenticate user and generate tokens
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValid = await HashUtils.comparePassword(data.password, user.password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.toUserResponse(user)
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenString: string): Promise<RefreshResponse> {
    // Find refresh token in database
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true }
    });

    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > refreshToken.expiresAt) {
      // Delete expired token
      await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Delete old refresh token (rotate tokens)
    await this.prisma.refreshToken.delete({
      where: { id: refreshToken.id }
    });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      refreshToken.user
    );

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<UserType> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.toUserResponse(user);
  }

  /**
   * Revoke a refresh token (logout)
   */
  async logout(refreshTokenString: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshTokenString }
    });
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Generate access token (JWT)
    const accessToken = JWTUtils.generateAccessToken(
      { userId: user.id, email: user.email },
      { secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRY }
    );

    // Generate refresh token (random secure token)
    const refreshTokenString = HashUtils.generateSecureToken(32);

    // Calculate expiry date
    const expiresAt = new Date();
    const days = parseInt(config.REFRESH_EXPIRY.replace('d', ''), 10);
    expiresAt.setDate(expiresAt.getDate() + days);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken: refreshTokenString
    };
  }

  /**
   * Convert Prisma User model to API User response
   */
  private toUserResponse(user: User): UserType {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString()
    };
  }

  /**
   * Cleanup expired refresh tokens (for maintenance)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }
}
