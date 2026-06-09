import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateConstituencyDto } from './create-constituency.dto';

export class UpdateConstituencyDto extends PartialType(OmitType(CreateConstituencyDto, ['districtId'] as const)) {}
