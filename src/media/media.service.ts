import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMediaDto) {
    const issue = await this.prisma.issue.findUnique({ where: { id: dto.issueId } });
    if (!issue) throw new NotFoundException('Issue not found');
    return this.prisma.issueMedia.create({ data: dto });
  }

  async findByIssue(issueId: string) {
    return this.prisma.issueMedia.findMany({ where: { issueId } });
  }

  async remove(id: string) {
    const media = await this.prisma.issueMedia.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return this.prisma.issueMedia.delete({ where: { id } });
  }
}
