import { OmitType } from '@nestjs/swagger';

import { CreateCopyDto } from './create-copy.dto';

export class CreateBookCopyDto extends OmitType(CreateCopyDto, [
  'openlibrary_work_id',
] as const) {}
