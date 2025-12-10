import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ description: 'Access token JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token JWT', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'User data' })
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    branchId?: number;
    role: { id: string; name: string } | null;
  };
}
