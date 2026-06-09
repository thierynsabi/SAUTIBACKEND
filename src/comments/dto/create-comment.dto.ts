import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Issue ID' })
  @IsUUID()
  issueId: string;

  @ApiProperty({ example: 'Asante kwa kazi nzuri', description: 'Comment message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for threading' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
