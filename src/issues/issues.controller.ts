import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  Query, UseGuards, ParseUUIDPipe, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { IssueFilterDto } from './filters/issue-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { Request } from 'express';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new issue (auth optional for anonymous)' })
  async create(@Body() dto: CreateIssueDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.issuesService.create(dto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues with filters' })
  findAll(@Query() filters: IssueFilterDto) {
    return this.issuesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID with full details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MP, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update issue status (MP/Admin only)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.issuesService.updateStatus(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete issue (owner or Admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.issuesService.remove(id, user.id, user.role);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get issue status change history' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.getStatusHistory(id);
  }
}
