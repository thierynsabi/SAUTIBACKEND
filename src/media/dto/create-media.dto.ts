import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ description: 'Issue ID' })
  @IsUUID()
  issueId: string;

  @ApiProperty({ description: 'Media URL' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'image', description: 'Media type (image/video/document)' })
  @IsString()
  type: string;
}
