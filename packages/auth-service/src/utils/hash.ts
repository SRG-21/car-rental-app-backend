import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class HashUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a cryptographically secure random token
   */
  static generateSecureToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hash a token using SHA-256 (for storing refresh tokens)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a random UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }
}
