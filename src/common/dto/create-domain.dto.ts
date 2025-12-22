import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsIn,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

// Custom transform function to normalize domain
function normalizeDomain(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }

  let normalized = value.toLowerCase().trim();

  // Remove protocol if present
  normalized = normalized.replace(/^https?:\/\//, '');

  // Remove trailing slashes and paths
  normalized = normalized.split('/')[0];

  // Remove trailing dots
  normalized = normalized.replace(/\.+$/, '');

  // Remove port number if present
  normalized = normalized.split(':')[0];

  return normalized;
}

// Custom validator function for domain format
function isValidDomainFormat(domain: string): boolean {
  if (!domain) return false;

  // Check for basic domain format (no spaces, basic characters)
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;

  if (!domainRegex.test(domain)) {
    return false;
  }

  // Check for minimum domain structure (at least one dot for TLD)
  if (!domain.includes('.')) {
    return false;
  }

  // Check that it doesn't start or end with a hyphen
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  // Check that segments don't start or end with hyphens
  const segments = domain.split('.');
  for (const segment of segments) {
    if (segment.startsWith('-') || segment.endsWith('-') || segment.length === 0) {
      return false;
    }
  }

  return true;
}

// Reserved domains that cannot be used
const RESERVED_DOMAINS = [
  'softellio.com',
  'platform.softellio.com',
  'portal.softellio.com',
  'api.softellio.com',
  'admin.softellio.com',
  'connect.softellio.com',
  'app.softellio.com',
  'dashboard.softellio.com',
  'mail.softellio.com',
  'localhost'
];

// Custom validator to check if domain is reserved
function isNotReservedDomain(domain: string): boolean {
  if (!domain) return true;

  const normalized = domain.toLowerCase();

  // Check exact matches
  if (RESERVED_DOMAINS.includes(normalized)) {
    return false;
  }

  // Check if it's a softellio.com subdomain (not allowed for custom domains)
  if (normalized.endsWith('.softellio.com')) {
    return false;
  }

  return true;
}

export class CreateDomainDto {
  @ApiProperty({
    example: 'hamza.com',
    description: 'The custom domain to add to the tenant. Must be a valid domain without protocol or paths.',
    maxLength: 253,
  })
  @IsString({ message: 'Domain must be a string' })
  @IsNotEmpty({ message: 'Domain is required' })
  @MaxLength(253, { message: 'Domain must not exceed 253 characters' })
  @Transform(({ value }) => {
    const normalized = normalizeDomain(value);

    // Validate domain format after normalization
    if (!isValidDomainFormat(normalized)) {
      throw new BadRequestException(
        'Invalid domain format. Please provide a valid domain name without protocol, paths, or special characters (e.g., example.com, www.example.com)'
      );
    }

    // Check if domain is reserved
    if (!isNotReservedDomain(normalized)) {
      throw new BadRequestException(
        'This domain is reserved and cannot be used. Softellio.com subdomains are not allowed for custom domains.'
      );
    }

    return normalized;
  })
  @Matches(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, {
    message: 'Invalid domain format. Domain must contain only letters, numbers, hyphens, and dots.'
  })
  domain: string;

  @ApiProperty({
    example: false,
    description: 'Whether this domain should be set as the primary domain for the tenant',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean value' })
  isPrimary?: boolean = false;

  @ApiProperty({
    example: 'custom',
    description: 'The type of domain being added',
    enum: ['custom', 'subdomain'],
    required: false,
    default: 'custom',
  })
  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  @IsIn(['custom', 'subdomain'], { message: 'Type must be either "custom" or "subdomain"' })
  type?: 'custom' | 'subdomain' = 'custom';
}