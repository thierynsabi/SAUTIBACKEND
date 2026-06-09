import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';

@Injectable()
export class ConstituenciesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConstituencyDto) {
    const district = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
    if (!district) throw new NotFoundException('District not found');
    return this.prisma.constituency.create({ data: dto, include: { district: { include: { region: true } } } });
  }

  findAll() {
    return this.prisma.constituency.findMany({
      include: {
        district: { include: { region: true } },
        _count: { select: { wards: true, mpAccounts: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const constituency = await this.prisma.constituency.findUnique({
      where: { id },
      include: {
        district: { include: { region: true } },
        wards: { orderBy: { name: 'asc' } },
        mpAccounts: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
    if (!constituency) throw new NotFoundException('Constituency not found');
    return constituency;
  }

  findByDistrict(districtId: string) {
    return this.prisma.constituency.findMany({ where: { districtId }, orderBy: { name: 'asc' } });
  }

  async update(id: string, dto: UpdateConstituencyDto) {
    await this.findOne(id);
    return this.prisma.constituency.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.constituency.delete({ where: { id } });
  }
}
