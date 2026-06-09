import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDistrictDto {
  @ApiProperty({ example: 'Mbeya City', description: 'District name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Region ID' })
  @IsUUID()
  regionId: string;
}
