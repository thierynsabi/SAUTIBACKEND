import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { IssueFilterDto } from './filters/issue-filter.dto';
import { Role, IssueStatus } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIssueDto, userId?: string) {
    const ward = await this.prisma.ward.findUnique({
      where: { id: dto.wardId },
      include: { constituency: true },
    });
    if (!ward) throw new NotFoundException('Ward not found');

    const issue = await this.prisma.issue.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        wardId: dto.wardId,
        userId: userId || null,
        isAnonymous: dto.isAnonymous || !userId,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        ward: { include: { constituency: true } },
      },
    });

    const mpAccount = await this.prisma.mpAccount.findFirst({
      where: { constituencyId: ward.constituencyId },
      include: { user: true },
    });

    if (mpAccount) {
      await this.prisma.issue.update({
        where: { id: issue.id },
        data: { assignedToId: mpAccount.userId },
      });

      await this.prisma.notification.create({
        data: {
          userId: mpAccount.userId,
          type: 'ISSUE_SUBMITTED',
          title: 'Tatizo Jipya Limewasilishwa',
          body: `${dto.isAnonymous ? 'Mtumiaji asiyejulikana' : dto.title} ameripoti tatizo katika kata yako`,
          data: { issueId: issue.id },
        },
      });
    }

    return this.prisma.issue.findUnique({
      where: { id: issue.id },
      include: {
        user: { select: { id: true, fullName: true } },
        ward: { include: { constituency: true } },
        _count: { select: { comments: true, votes: true, media: true } },
      },
    });
  }

  async findAll(filters: IssueFilterDto) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.wardId) where.wardId = filters.wardId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.constituencyId) {
      where.ward = { constituencyId: filters.constituencyId };
    }
    if (filters.districtId) {
      where.ward = { ...where.ward, constituency: { districtId: filters.districtId } };
    }
    if (filters.regionId) {
      where.ward = {
        ...where.ward,
        constituency: { district: { regionId: filters.regionId } },
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.issue.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true } },
        ward: { include: { constituency: { include: { district: { include: { region: true } } } } } },
        _count: { select: { comments: true, votes: true, media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        ward: { include: { constituency: { include: { district: { include: { region: true } } } } } },
        comments: {
          include: { user: { select: { id: true, fullName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        media: true,
        statusHistory: {
          include: { changedBy: { select: { id: true, fullName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { votes: true, comments: true, media: true } },
      },
    });

    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async updateStatus(id: string, dto: UpdateIssueStatusDto, userId: string, userRole: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');

    if (userRole !== Role.ADMIN && userRole !== Role.MP) {
      throw new ForbiddenException('Only MP or Admin can update issue status');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.issueStatusHistory.create({
        data: {
          issueId: id,
          oldStatus: issue.status,
          newStatus: dto.status,
          changedById: userId,
          comment: dto.comment,
        },
      });

      const result = await tx.issue.update({
        where: { id },
        data: { status: dto.status },
        include: {
          user: { select: { id: true, fullName: true } },
          ward: true,
        },
      });

      if (result.userId) {
        const notifType = dto.status === 'RESOLVED' ? 'ISSUE_RESOLVED' : 'STATUS_CHANGED';
        await tx.notification.create({
          data: {
            userId: result.userId,
            type: notifType,
            title: dto.status === 'RESOLVED' ? 'Tatizo Limesuluhishwa' : 'Hali ya Tatizo Imebadilishwa',
            body: `Tatizo lako "${result.title}" limebadilishwa hadi ${dto.status}`,
            data: { issueId: id, status: dto.status },
          },
        });
      }

      return result;
    });

    return updated;
  }

  async remove(id: string, userId: string, userRole: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');

    if (issue.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own issues');
    }

    return this.prisma.issue.delete({ where: { id } });
  }

  async getStatusHistory(id: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');

    return this.prisma.issueStatusHistory.findMany({
      where: { issueId: id },
      include: { changedBy: { select: { id: true, fullName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
