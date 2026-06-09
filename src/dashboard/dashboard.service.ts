import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(wardId?: string) {
    const whereFilter = wardId ? { wardId } : {};

    const [totalIssues, pendingIssues, inProgressIssues, resolvedIssues, totalAnnouncements, totalPromises, totalUsers] =
      await Promise.all([
        this.prisma.issue.count({ where: whereFilter }),
        this.prisma.issue.count({ where: { ...whereFilter, status: 'PENDING' } }),
        this.prisma.issue.count({ where: { ...whereFilter, status: 'IN_PROGRESS' } }),
        this.prisma.issue.count({ where: { ...whereFilter, status: 'RESOLVED' } }),
        this.prisma.announcement.count(),
        this.prisma.promise.count(),
        this.prisma.user.count({ where: { role: 'CITIZEN' } }),
      ]);

    return {
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      totalAnnouncements,
      totalPromises,
      totalUsers,
      resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
    };
  }

  async getWardAnalytics() {
    const wards = await this.prisma.ward.findMany({
      include: {
        constituency: { include: { district: { include: { region: true } } } },
        _count: { select: { issues: true, users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return wards.map((ward) => ({
      id: ward.id,
      name: ward.name,
      constituency: ward.constituency.name,
      district: ward.constituency.district.name,
      region: ward.constituency.district.region.name,
      totalIssues: ward._count.issues,
      totalUsers: ward._count.users,
    }));
  }

  async getIssueTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await this.prisma.issue.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, status: true, category: true },
    });

    const trendsByDate = issues.reduce(
      (acc, issue) => {
        const date = issue.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 };
        }
        acc[date].total++;
        acc[date][issue.status]++;
        return acc;
      },
      {} as Record<string, any>,
    );

    const categoryBreakdown = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.category]) {
          acc[issue.category] = { category: issue.category, count: 0 };
        }
        acc[issue.category].count++;
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      dailyTrends: Object.values(trendsByDate),
      categoryBreakdown: Object.values(categoryBreakdown),
    };
  }

  async getRecentIssues(limit = 5) {
    return this.prisma.issue.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true } },
        ward: { select: { id: true, name: true } },
        _count: { select: { votes: true, comments: true } },
      },
    });
  }

  async getTopVoted(limit = 10) {
    return this.prisma.issue.findMany({
      take: limit,
      orderBy: { votes: { _count: 'desc' } },
      include: {
        _count: { select: { votes: true } },
        ward: { select: { id: true, name: true } },
      },
    });
  }

  async getPromiseProgressAnalytics() {
    const promises = await this.prisma.promise.findMany();

    return {
      total: promises.length,
      notStarted: promises.filter((p) => p.status === 'NOT_STARTED').length,
      ongoing: promises.filter((p) => p.status === 'ONGOING').length,
      completed: promises.filter((p) => p.status === 'COMPLETED').length,
      averageProgress: promises.length > 0
        ? Math.round(promises.reduce((sum, p) => sum + p.progressPercentage, 0) / promises.length)
        : 0,
      byCategory: promises.reduce(
        (acc, p) => {
          if (!acc[p.category]) acc[p.category] = { category: p.category, total: 0, averageProgress: 0 };
          acc[p.category].total++;
          acc[p.category].averageProgress += p.progressPercentage;
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }

  async getIssuesByRegion() {
    const regions = await this.prisma.region.findMany({
      include: {
        districts: {
          include: {
            constituencies: {
              include: {
                wards: {
                  include: { _count: { select: { issues: true } } },
                },
              },
            },
          },
        },
      },
    });

    return regions.map((region) => ({
      region: region.name,
      totalIssues: region.districts.reduce(
        (sum, d) => sum + d.constituencies.reduce(
          (s, c) => s + c.wards.reduce((sw, w) => sw + w._count.issues, 0), 0
        ), 0
      ),
    }));
  }

  async getMonthlyTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const issues = await this.prisma.issue.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });

    const trends = issues.reduce(
      (acc, issue) => {
        const key = `${issue.createdAt.getFullYear()}-${String(issue.createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) {
          acc[key] = { month: key, total: 0, resolved: 0, pending: 0, inProgress: 0 };
        }
        acc[key].total++;
        if (issue.status === 'RESOLVED') acc[key].resolved++;
        else if (issue.status === 'PENDING') acc[key].pending++;
        else if (issue.status === 'IN_PROGRESS') acc[key].inProgress++;
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(trends).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }
}
