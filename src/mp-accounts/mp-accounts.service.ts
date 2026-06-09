import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpAccountDto } from './dto/create-mp-account.dto';
import { Role } from '@prisma/client';

@Injectable()
export class MpAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMpAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.MP) throw new BadRequestException('User must have MP role');

    const constituency = await this.prisma.constituency.findUnique({ where: { id: dto.constituencyId } });
    if (!constituency) throw new NotFoundException('Constituency not found');

    return this.prisma.mpAccount.create({
      data: dto,
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        constituency: { include: { district: { include: { region: true } } } },
      },
    });
  }

  findAll() {
    return this.prisma.mpAccount.findMany({
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        constituency: { include: { district: { include: { region: true } } } },
      },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.mpAccount.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        constituency: { include: { district: { include: { region: true } }, wards: true } },
      },
    });
    if (!account) throw new NotFoundException('MP account not found');
    return account;
  }

  async findByConstituency(constituencyId: string) {
    return this.prisma.mpAccount.findFirst({
      where: { constituencyId },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mpAccount.delete({ where: { id } });
  }
}
