import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('statistics')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStatistics(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getStatistics(filters.wardId);
  }

  @Get('ward-analytics')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get issues analytics by ward' })
  async getWardAnalytics() {
    return this.dashboardService.getWardAnalytics();
  }

  @Get('issue-trends')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get issue trends (last 30 days)' })
  async getIssueTrends() {
    return this.dashboardService.getIssueTrends();
  }

  @Get('recent-issues')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get recent issues' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentIssues(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentIssues(limit ? parseInt(limit, 10) : 5);
  }

  @Get('top-voted')
  @ApiOperation({ summary: 'Get most supported issues' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopVoted(@Query('limit') limit?: string) {
    return this.dashboardService.getTopVoted(limit ? parseInt(limit, 10) : 10);
  }

  @Get('promise-analytics')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get promise progress analytics' })
  async getPromiseAnalytics() {
    return this.dashboardService.getPromiseProgressAnalytics();
  }

  @Get('by-region')
  @Roles(Role.MP, Role.ADMIN)
  @ApiOperation({ summary: 'Get issues by region' })
  async getIssuesByRegion() {
    return this.dashboardService.getIssuesByRegion();
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Get monthly issue trends (last 6 months)' })
  async getMonthlyTrends() {
    return this.dashboardService.getMonthlyTrends();
  }
}
