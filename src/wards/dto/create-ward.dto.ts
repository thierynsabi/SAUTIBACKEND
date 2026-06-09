import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWardDto {
  @ApiProperty({ example: 'Iyela', description: 'Ward name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Constituency ID' })
  @IsUUID()
  constituencyId: string;
}
