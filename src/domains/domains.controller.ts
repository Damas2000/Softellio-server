import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import {
  CreateDomainDto,
  UpdateDomainDto,
  DomainWithInstructionsDto,
  VerifyDomainResponseDto,
} from './dto';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Domains (Tenant Admin)')
@Controller('domains')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Roles(Role.TENANT_ADMIN)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a custom domain',
    description: 'Add a new custom domain to the tenant. Returns domain details with DNS verification instructions.'
  })
  @ApiResponse({
    status: 201,
    description: 'Domain created successfully',
    type: DomainWithInstructionsDto,
    example: {
      id: 1,
      domain: 'hamza.com',
      type: 'CUSTOM',
      isPrimary: false,
      isActive: true,
      isVerified: false,
      sslStatus: 'PENDING',
      verifiedAt: null,
      dnsInstructions: {
        type: 'TXT',
        host: '@',
        value: 'softellio-verify=abc123def456',
        instructions: 'Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap)'
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid domain format or reserved domain',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid domain format or reserved domain. Custom domains cannot use *.softellio.com or reserved domains.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Domain already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'This domain is already registered to another tenant',
        error: 'Conflict'
      }
    }
  })
  create(
    @CurrentTenant() tenantId: number,
    @Body() createDomainDto: CreateDomainDto,
  ): Promise<DomainWithInstructionsDto> {
    return this.domainsService.create(tenantId, createDomainDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all domains',
    description: 'Get all domains for the current tenant, ordered by primary status and creation date.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of domains',
    type: [DomainWithInstructionsDto]
  })
  findAll(@CurrentTenant() tenantId: number): Promise<DomainWithInstructionsDto[]> {
    return this.domainsService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get domain by ID',
    description: 'Get domain details including DNS verification instructions.'
  })
  @ApiParam({
    name: 'id',
    description: 'Domain ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Domain details',
    type: DomainWithInstructionsDto
  })
  @ApiResponse({
    status: 404,
    description: 'Domain not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Domain not found',
        error: 'Not Found'
      }
    }
  })
  findOne(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DomainWithInstructionsDto> {
    return this.domainsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update domain settings',
    description: 'Update domain settings such as primary status and active status. Only verified custom domains can be set as primary.'
  })
  @ApiParam({
    name: 'id',
    description: 'Domain ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Domain updated successfully',
    type: DomainWithInstructionsDto
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot set unverified custom domain as primary',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot set unverified custom domain as primary',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Domain not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Domain not found',
        error: 'Not Found'
      }
    }
  })
  update(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDomainDto: UpdateDomainDto,
  ): Promise<DomainWithInstructionsDto> {
    return this.domainsService.update(tenantId, id, updateDomainDto);
  }

  @Post('verify/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify domain ownership',
    description: 'Verify domain ownership by checking DNS TXT record. Once verified, the domain can be set as primary and used for SSL.'
  })
  @ApiParam({
    name: 'id',
    description: 'Domain ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Domain verification result',
    type: VerifyDomainResponseDto,
    examples: {
      verified: {
        summary: 'Domain verified successfully',
        value: {
          status: 'verified',
          message: 'Domain successfully verified!',
          checkedRecords: ['TXT @ softellio-verify=abc123def456'],
          verifiedAt: '2024-01-15T10:35:00Z'
        }
      },
      pending: {
        summary: 'Domain verification pending',
        value: {
          status: 'pending',
          message: 'Verification record not found. Please ensure the TXT record is added to your DNS settings.',
          checkedRecords: ['TXT @ example-existing-record']
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Domain not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Domain not found',
        error: 'Not Found'
      }
    }
  })
  verify(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VerifyDomainResponseDto> {
    return this.domainsService.verify(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete domain',
    description: 'Soft delete a domain by setting it as inactive. Cannot delete the last active domain.'
  })
  @ApiParam({
    name: 'id',
    description: 'Domain ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Domain deleted successfully',
    schema: {
      example: {
        message: 'Domain deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete the last active domain',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot delete the last active domain. Please add another domain first.',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Domain not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Domain not found',
        error: 'Not Found'
      }
    }
  })
  remove(
    @CurrentTenant() tenantId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.domainsService.remove(tenantId, id);
  }
}