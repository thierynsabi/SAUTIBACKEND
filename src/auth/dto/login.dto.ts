import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+255712345678', description: 'Phone number with country code' })
  @IsString()
  @Matches(/^\+255\d{9}$/, { message: 'Phone number must be a valid Tanzanian number (+255xxxxxxxxx)' })
  phoneNumber: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}
