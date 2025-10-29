import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionService } from './services/session.service';
import { SessionData, AuthTokens } from './types/auth.types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async register(
    registerDto: RegisterDto,
    sessionData?: Partial<SessionData>,
  ): Promise<AuthResponseDto> {
    const { email, password, fname, lname, fullName } = registerDto;

    // Construct full name from first and last name if not provided
    const userFullName =
      fullName ||
      (fname && lname ? `${fname} ${lname}` : fname || lname || undefined);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Find default role (VIEWER)
    let defaultRole = await this.prisma.role.findUnique({
      where: { name: 'VIEWER' },
    });

    // Create default role if it doesn't exist
    if (!defaultRole) {
      defaultRole = await this.prisma.role.create({
        data: {
          name: 'VIEWER',
          description: 'Default viewer role',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: userFullName,
        roleId: defaultRole.id,
      },
      include: {
        role: true,
      },
    });

    // Create session and generate tokens
    const tokens = await this.sessionService.createSession(
      user.id,
      sessionData || {},
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || undefined,
        role: user.role.name,
        createdAt: user.createdAt,
      },
    };
  }

  async login(
    loginDto: LoginDto,
    sessionData?: Partial<SessionData>,
  ): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create session and generate tokens
    const tokens = await this.sessionService.createSession(
      user.id,
      sessionData || {},
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || undefined,
        role: user.role.name,
        createdAt: user.createdAt,
      },
    };
  }

  async refreshTokens(
    refreshToken: string,
    sessionData?: Partial<SessionData>,
  ): Promise<AuthTokens> {
    return this.sessionService.refreshTokens(refreshToken, sessionData || {});
  }

  async logout(refreshToken: string): Promise<void> {
    await this.sessionService.revokeSession(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
  }

  async validateUser(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
