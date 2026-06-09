import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMpAccountDto {
  @ApiProperty({ description: 'User ID (must have MP role)' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Constituency ID' })
  @IsUUID()
  constituencyId: string;

  @ApiPropertyOptional({ example: 'Nina uzoefu wa miaka 10 katika siasa...', description: 'Bio' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ example: '+255712345678', description: 'Public phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'mp@bunge.go.tz', description: 'Public email' })
  @IsString()
  @IsOptional()
  email?: string;
}
