import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';

@Injectable()
export class WardsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWardDto) {
    const constituency = await this.prisma.constituency.findUnique({ where: { id: dto.constituencyId } });
    if (!constituency) throw new NotFoundException('Constituency not found');
    return this.prisma.ward.create({
      data: dto,
      include: { constituency: { include: { district: { include: { region: true } } } } },
    });
  }

  findAll() {
    return this.prisma.ward.findMany({
      include: {
        constituency: { include: { district: { include: { region: true } } } },
        _count: { select: { issues: true, users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
      include: { constituency: { include: { district: { include: { region: true } } } } },
    });
    if (!ward) throw new NotFoundException('Ward not found');
    return ward;
  }

  async findByConstituency(constituencyId: string) {
    return this.prisma.ward.findMany({ where: { constituencyId }, orderBy: { name: 'asc' } });
  }

  async update(id: string, dto: UpdateWardDto) {
    await this.findOne(id);
    return this.prisma.ward.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ward.delete({ where: { id } });
  }
}
