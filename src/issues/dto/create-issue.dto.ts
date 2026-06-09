import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIssueDto {
  @ApiProperty({ example: 'Barabara ya Mlimani imeharibika', description: 'Issue title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Barabara kuu ina mashimo makubwa...', description: 'Issue description' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'infrastructure', description: 'Issue category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Ward ID' })
  @IsUUID()
  wardId: string;

  @ApiPropertyOptional({ default: false, description: 'Submit anonymously' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
