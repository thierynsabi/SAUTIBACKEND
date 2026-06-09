import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDistrictDto } from './create-district.dto';

export class UpdateDistrictDto extends PartialType(OmitType(CreateDistrictDto, ['regionId'] as const)) {}
