import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  tenantId?: number;

  @ApiProperty()
  isActive: boolean;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken: string;
}