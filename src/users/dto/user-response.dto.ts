import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clm1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  fullName?: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-10-27T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2023-10-27T10:00:00.000Z',
  })
  updatedAt: Date;
}
