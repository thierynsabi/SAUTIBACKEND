import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MpAccountsService } from './mp-accounts.service';
import { CreateMpAccountDto } from './dto/create-mp-account.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('MP Accounts')
@Controller('mp-accounts')
export class MpAccountsController {
  constructor(private mpAccountsService: MpAccountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create MP account (Admin only)' })
  create(@Body() dto: CreateMpAccountDto) {
    return this.mpAccountsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all MP accounts' })
  findAll() {
    return this.mpAccountsService.findAll();
  }

  @Get('constituency/:constituencyId')
  @ApiOperation({ summary: 'Get MP by constituency' })
  findByConstituency(@Param('constituencyId', ParseUUIDPipe) constituencyId: string) {
    return this.mpAccountsService.findByConstituency(constituencyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get MP account details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mpAccountsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete MP account (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mpAccountsService.remove(id);
  }
}
