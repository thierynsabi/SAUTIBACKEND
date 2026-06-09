import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConstituenciesService } from './constituencies.service';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Constituencies')
@Controller('constituencies')
export class ConstituenciesController {
  constructor(private constituenciesService: ConstituenciesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create constituency (Admin only)' })
  create(@Body() dto: CreateConstituencyDto) {
    return this.constituenciesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all constituencies' })
  findAll() {
    return this.constituenciesService.findAll();
  }

  @Get('by-district/:districtId')
  @ApiOperation({ summary: 'Get constituencies by district' })
  findByDistrict(@Param('districtId', ParseUUIDPipe) districtId: string) {
    return this.constituenciesService.findByDistrict(districtId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get constituency with wards and MP' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.constituenciesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update constituency (Admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateConstituencyDto) {
    return this.constituenciesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete constituency (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.constituenciesService.remove(id);
  }
}
