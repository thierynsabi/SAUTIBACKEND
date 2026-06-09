import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(
    phoneNumber: string,
    password: string,
  ): Promise<{ accessToken: string; user: any }> {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid phone number or password');
    }
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const accessToken = await this.generateAccessToken(user.id, user.phoneNumber!, user.role);

    return { accessToken, user };
  }

  async register(
    fullName: string,
    phoneNumber: string,
    password: string,
    role: string,
    wardId: string,
  ): Promise<{ accessToken: string; user: any }> {
    const existingUser = await this.prisma.user.findUnique({ where: { phoneNumber } });

    if (existingUser) {
      throw new BadRequestException('User with this phone number already exists');
    }

    const ward = await this.prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) {
      throw new BadRequestException('Ward not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { fullName, phoneNumber, passwordHash, role: role as any, wardId },
    });

    const accessToken = await this.generateAccessToken(user.id, user.phoneNumber!, user.role);

    return { accessToken, user };
  }

  private async generateAccessToken(
    userId: string,
    phoneNumber: string,
    role: string,
  ): Promise<string> {
    const payload = { sub: userId, phoneNumber, role };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '7d'),
    });
  }
}
