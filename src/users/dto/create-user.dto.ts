import { IsString, IsEnum, IsUUID, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+255712345678', description: 'Phone number with country code' })
  @IsString()
  @Matches(/^\+255\d{9}$/, { message: 'Phone number must be a valid Tanzanian number (+255xxxxxxxxx)' })
  phoneNumber: string;

  @ApiProperty({ enum: Role, default: Role.CITIZEN })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Ward ID the user belongs to' })
  @IsUUID()
  wardId: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;
}
