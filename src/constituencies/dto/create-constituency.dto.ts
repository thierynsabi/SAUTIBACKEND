import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConstituencyDto {
  @ApiProperty({ example: 'Mbeya Town', description: 'Constituency name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'District ID' })
  @IsUUID()
  districtId: string;
}
