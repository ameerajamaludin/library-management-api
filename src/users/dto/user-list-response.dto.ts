import { ApiProperty } from '@nestjs/swagger';

export class UserListRoleResponseDto {
  @ApiProperty({
    example: 1,
  })
  role_id: number;

  @ApiProperty({
    example: 'ADMIN',
  })
  role_name: string;
}

// Returned by GET /users. The three status flags describe
// what the user currently has out, not any detail about a
// specific borrow or fine, so the list stays a summary of
// every user in one request.
export class UserListItemResponseDto {
  @ApiProperty({
    example: 'L002',
  })
  user_id: string;

  @ApiProperty({
    example: 'Aminah binti Hassan',
  })
  name: string;

  @ApiProperty({
    example:
      'aminah.hassan@perpustakaan.com',
  })
  email: string;

  @ApiProperty({
    example: 1,
  })
  role_id: number;

  @ApiProperty({
    type: UserListRoleResponseDto,
  })
  role: UserListRoleResponseDto;

  @ApiProperty({
    example: true,
    description:
      'True when the user has at least one borrow that has not been returned.',
  })
  has_active_borrow: boolean;

  @ApiProperty({
    example: true,
    description:
      'True when at least one fine raised against the user has not been settled. A fine is settled once its status is PAID.',
  })
  has_active_fine: boolean;

  @ApiProperty({
    example: true,
    description:
      'True when the user has a borrow that is unreturned and more than one calendar day past its due date.',
  })
  has_overdue_book: boolean;
}