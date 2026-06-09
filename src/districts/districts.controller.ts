import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
  constructor(private districtsService: DistrictsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create district (Admin only)' })
  create(@Body() dto: CreateDistrictDto) {
    return this.districtsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all districts' })
  findAll() {
    return this.districtsService.findAll();
  }

  @Get('by-region/:regionId')
  @ApiOperation({ summary: 'Get districts by region' })
  findByRegion(@Param('regionId', ParseUUIDPipe) regionId: string) {
    return this.districtsService.findByRegion(regionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get district with constituencies' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.districtsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update district (Admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDistrictDto) {
    return this.districtsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete district (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.districtsService.remove(id);
  }
}
