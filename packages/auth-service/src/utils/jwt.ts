import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenConfig {
  secret: string;
  expiresIn: string;
}

export class JWTUtils {
  /**
   * Generate a JWT access token
   */
  static generateAccessToken(
    payload: { userId: string; email: string },
    config: TokenConfig
  ): string {
    return jwt.sign(
      payload,
      config.secret,
      { expiresIn: config.expiresIn } as jwt.SignOptions
    );
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string, secret: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256']
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
