import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Injectable()
export class DistrictsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDistrictDto) {
    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) throw new NotFoundException('Region not found');
    return this.prisma.district.create({ data: dto, include: { region: true } });
  }

  findAll() {
    return this.prisma.district.findMany({
      include: { region: true, _count: { select: { constituencies: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const district = await this.prisma.district.findUnique({
      where: { id },
      include: {
        region: true,
        constituencies: {
          include: { _count: { select: { wards: true } } },
        },
      },
    });
    if (!district) throw new NotFoundException('District not found');
    return district;
  }

  findByRegion(regionId: string) {
    return this.prisma.district.findMany({ where: { regionId }, orderBy: { name: 'asc' } });
  }

  async update(id: string, dto: UpdateDistrictDto) {
    await this.findOne(id);
    return this.prisma.district.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.district.delete({ where: { id } });
  }
}
