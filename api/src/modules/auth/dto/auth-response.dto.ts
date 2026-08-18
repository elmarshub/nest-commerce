import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJkjndkjdlklHGBAuikidHJJJieidendJHKJjninJNIKNbhbhbVGVuniIhbuNI',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJkjndkjdlklHGBAuikidHJJJieidendJHKJjninJNIKNbhbhbVGVuniIhbuNI',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    type: AuthUserDto,
  })
  user!: AuthUserDto;
}
