import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, userId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: dto.issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    if (dto.parentId) {
      const parent = await this.prisma.issueComment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.issueId !== dto.issueId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.issueComment.create({
      data: { issueId: dto.issueId, userId, message: dto.message, parentId: dto.parentId },
      include: { user: { select: { id: true, fullName: true, role: true } } },
    });

    await this.prisma.notification.create({
      data: {
        userId: issue.userId!,
        type: 'COMMENT_ADDED',
        title: 'Maoni Mapya',
        body: `Kuna maoni mapya kwenye tatizo lako "${issue.title}"`,
        data: { issueId: dto.issueId, commentId: comment.id },
      },
    });

    return comment;
  }

  async findByIssue(issueId: string) {
    return this.prisma.issueComment.findMany({
      where: { issueId, parentId: null },
      include: {
        user: { select: { id: true, fullName: true, role: true } },
        replies: {
          include: { user: { select: { id: true, fullName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const comment = await this.prisma.issueComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.issueComment.delete({ where: { id } });
  }
}
