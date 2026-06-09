import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WardsService } from './wards.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Wards')
@Controller('wards')
export class WardsController {
  constructor(private wardsService: WardsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ward (Admin only)' })
  create(@Body() dto: CreateWardDto) {
    return this.wardsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wards' })
  findAll() {
    return this.wardsService.findAll();
  }

  @Get('by-constituency/:constituencyId')
  @ApiOperation({ summary: 'Get wards by constituency' })
  findByConstituency(@Param('constituencyId', ParseUUIDPipe) constituencyId: string) {
    return this.wardsService.findByConstituency(constituencyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ward details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.wardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ward (Admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWardDto) {
    return this.wardsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ward (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.wardsService.remove(id);
  }
}
