import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateFineDto {
  @ApiPropertyOptional({
    description:
      'New fine amount. Optional, and supplied independently: send it on its own to change the amount and the reason, status and paid date keep their current values. It overrides the calculated amount of overdue days multiplied by the RM2 daily rate, so use it to correct an amount rather than to recalculate one.',
    example: 5.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description:
      'New reason for the fine. Optional, and supplied independently: send it on its own and the amount, status and paid date keep their current values.',
    example: 'Late return',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;

  @ApiPropertyOptional({
    description:
      'New fine payment status, either UNPAID or PAID. Optional, and supplied independently. A fine cannot be set to PAID without a recorded payer, so a fine that has never been paid is rejected with 409 if you send PAID here — pay it through POST /fines/{id}/pay instead, which records the payer and the payment time.',
    example: 'PAID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsIn(['UNPAID', 'PAID'])
  status?: string;

  @ApiPropertyOptional({
    description:
      'New date and time when the fine was paid. Optional, and supplied independently: send it on its own and the amount, reason and status keep their current values.',
    example: '2026-09-30T10:30:00.000Z',
  })
  @IsOptional()
  paid_at?: Date | null;
}