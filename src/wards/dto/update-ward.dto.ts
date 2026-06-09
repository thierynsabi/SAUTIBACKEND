import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWardDto } from './create-ward.dto';

export class UpdateWardDto extends PartialType(OmitType(CreateWardDto, ['constituencyId'] as const)) {}
