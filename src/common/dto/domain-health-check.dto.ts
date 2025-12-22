import { ApiProperty } from '@nestjs/swagger';

export class DomainHealthCheckDto {
  @ApiProperty({
    example: 'example.com',
    description: 'The domain that was checked',
  })
  domain: string;

  @ApiProperty({
    example: true,
    description: 'Whether the domain is reachable',
  })
  isReachable: boolean;

  @ApiProperty({
    example: 250,
    description: 'Response time in milliseconds',
    nullable: true,
  })
  responseTime: number | null;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
    nullable: true,
  })
  statusCode: number | null;

  @ApiProperty({
    example: null,
    description: 'Error message if domain is not reachable',
    nullable: true,
  })
  error: string | null;

  @ApiProperty({
    example: '2025-12-22T10:30:00Z',
    description: 'Timestamp when the check was performed',
  })
  checkedAt: Date;
}