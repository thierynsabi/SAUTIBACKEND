import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async vote(issueId: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    const existing = await this.prisma.issueVote.findUnique({
      where: { issueId_userId: { issueId, userId } },
    });
    if (existing) throw new ConflictException('Already voted');

    return this.prisma.issueVote.create({
      data: { issueId, userId },
    });
  }

  async unvote(issueId: string, userId: string) {
    const existing = await this.prisma.issueVote.findUnique({
      where: { issueId_userId: { issueId, userId } },
    });
    if (!existing) throw new NotFoundException('Vote not found');

    await this.prisma.issueVote.delete({ where: { id: existing.id } });
    return { message: 'Vote removed' };
  }
}
