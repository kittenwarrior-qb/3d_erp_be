import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokens, JwtPayload, SessionData } from '../types/auth.types';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createSession(
    userId: string,
    sessionData: Partial<SessionData>,
  ): Promise<AuthTokens> {
    // Generate refresh token
    const refreshToken = this.generateRefreshToken();

    // Create session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent: sessionData.userAgent,
        ip: sessionData.ip,
        expiresAt,
      },
    });

    // Generate access token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
    sessionData: Partial<SessionData>,
  ): Promise<AuthTokens> {
    // Find session by refresh token
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    const newRefreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update session with new refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        userAgent: sessionData.userAgent,
        ip: sessionData.ip,
        expiresAt,
      },
    });

    // Generate new access token
    const payload: JwtPayload = {
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeSession(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
