import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssueStatus } from '@prisma/client';

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: IssueStatus, example: IssueStatus.IN_PROGRESS })
  @IsEnum(IssueStatus)
  status: IssueStatus;

  @ApiPropertyOptional({ example: 'Nimewasiliana na TANROADS kuanza matengenezo' })
  @IsString()
  @IsOptional()
  comment?: string;
}
