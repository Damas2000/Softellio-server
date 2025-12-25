import { ApiProperty } from '@nestjs/swagger';
import { DomainType, DomainSSLStatus } from '@prisma/client';

export class DnsInstructionsDto {
  @ApiProperty({
    description: 'DNS record type',
    example: 'TXT'
  })
  type: 'TXT' | 'CNAME';

  @ApiProperty({
    description: 'DNS record host/name',
    example: '@'
  })
  host: string;

  @ApiProperty({
    description: 'DNS record value',
    example: 'softellio-verify=abc123def456'
  })
  value: string;

  @ApiProperty({
    description: 'Instructions for the user',
    example: 'Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap)'
  })
  instructions: string;
}

export class DomainWithInstructionsDto {
  @ApiProperty({
    description: 'Domain ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Domain name',
    example: 'hamza.com'
  })
  domain: string;

  @ApiProperty({
    description: 'Domain type',
    enum: DomainType,
    example: DomainType.CUSTOM
  })
  type: DomainType;

  @ApiProperty({
    description: 'Whether this domain is primary',
    example: false
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'Whether this domain is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this domain is verified',
    example: false
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'SSL status',
    enum: DomainSSLStatus,
    example: DomainSSLStatus.PENDING
  })
  sslStatus: DomainSSLStatus;

  @ApiProperty({
    description: 'When the domain was verified',
    example: null,
    required: false
  })
  verifiedAt: Date | null;

  @ApiProperty({
    description: 'DNS verification instructions',
    type: DnsInstructionsDto
  })
  dnsInstructions: DnsInstructionsDto;

  @ApiProperty({
    description: 'When the domain was created',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the domain was last updated',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
}

export class VerifyDomainResponseDto {
  @ApiProperty({
    description: 'Verification status',
    enum: ['verified', 'pending', 'failed'],
    example: 'verified'
  })
  status: 'verified' | 'pending' | 'failed';

  @ApiProperty({
    description: 'Verification message',
    example: 'Domain successfully verified!'
  })
  message: string;

  @ApiProperty({
    description: 'DNS records that were checked',
    example: ['TXT @ softellio-verify=abc123def456']
  })
  checkedRecords: string[];

  @ApiProperty({
    description: 'When verification was completed (if successful)',
    example: '2024-01-15T10:35:00Z',
    required: false
  })
  verifiedAt?: Date;
}