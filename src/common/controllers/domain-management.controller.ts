import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { DomainResolverService } from '../services/domain-resolver.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentTenant } from '../decorators/current-tenant.decorator';
import { Role } from '@prisma/client';
import { TenantDomain } from '@prisma/client';
import { CreateDomainDto } from '../dto/create-domain.dto';
import { UpdateDomainDto } from '../dto/update-domain.dto';
import { DomainHealthCheckDto } from '../dto/domain-health-check.dto';


@ApiTags('Domain Management')
@Controller('domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DomainManagementController {
  constructor(private domainResolver: DomainResolverService) {}

  @Get()
  @ApiOperation({ summary: 'Get all domains for current tenant' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain for multi-tenant operations',
    required: true,
    example: 'demo.softellio.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of tenant domains retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          tenantId: { type: 'number' },
          domain: { type: 'string' },
          isPrimary: { type: 'boolean' },
          isActive: { type: 'boolean' },
          type: { type: 'string' },
          isVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  async getTenantDomains(@CurrentTenant() tenantId: number): Promise<TenantDomain[]> {
    return this.domainResolver.getTenantDomains(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Add custom domain to tenant' })
  @ApiBody({
    type: CreateDomainDto,
    description: 'Domain details to add to the tenant',
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain for multi-tenant operations',
    required: true,
    example: 'demo.softellio.com',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Custom domain added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        tenantId: { type: 'number' },
        domain: { type: 'string' },
        isPrimary: { type: 'boolean' },
        isActive: { type: 'boolean' },
        type: { type: 'string' },
        isVerified: { type: 'boolean' },
        verificationToken: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid domain format or reserved domain',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Domain already exists for another tenant',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions or tenant inactive',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async addCustomDomain(
    @CurrentTenant() tenantId: number,
    @Body() createDomainDto: CreateDomainDto,
  ): Promise<TenantDomain> {
    return this.domainResolver.addCustomDomain(
      tenantId,
      createDomainDto.domain,
      createDomainDto.isPrimary || false,
    );
  }

  @Patch(':domainId')
  @ApiOperation({ summary: 'Update domain settings' })
  @ApiParam({ name: 'domainId', description: 'Domain ID', type: 'number' })
  @ApiBody({
    type: UpdateDomainDto,
    description: 'Domain settings to update',
  })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain for multi-tenant operations',
    required: true,
    example: 'demo.softellio.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        tenantId: { type: 'number' },
        domain: { type: 'string' },
        isPrimary: { type: 'boolean' },
        isActive: { type: 'boolean' },
        type: { type: 'string' },
        isVerified: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async updateDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
    @Body() updateDomainDto: UpdateDomainDto,
  ): Promise<TenantDomain> {
    return this.domainResolver.updateDomain(tenantId, domainId, updateDomainDto);
  }

  @Delete(':domainId')
  @ApiOperation({ summary: 'Remove domain from tenant' })
  @ApiParam({ name: 'domainId', description: 'Domain ID', type: 'number' })
  @ApiHeader({
    name: 'X-Tenant-Host',
    description: 'Tenant domain for multi-tenant operations',
    required: true,
    example: 'demo.softellio.com',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Domain removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
  ): Promise<void> {
    await this.domainResolver.removeDomain(tenantId, domainId);
  }

  @Get(':domainId/health')
  @ApiOperation({ summary: 'Check domain health and accessibility' })
  @ApiParam({ name: 'domainId', description: 'Domain ID or domain name' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain health check completed',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.EDITOR)
  async checkDomainHealth(@Param('domainId') domainParam: string): Promise<DomainHealthCheckDto> {
    // If domainParam is numeric, treat as ID, otherwise as domain name
    const domain = isNaN(Number(domainParam)) ? domainParam : domainParam;

    const healthCheck = await this.domainResolver.checkDomainHealth(domain);

    return {
      ...healthCheck,
      checkedAt: new Date(),
    };
  }

  @Get('resolve')
  @ApiOperation({ summary: 'Test domain resolution for debugging' })
  @ApiQuery({ name: 'domain', description: 'Domain to resolve' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain resolution test completed',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async testDomainResolution(@Query('domain') domain: string) {
    if (!domain) {
      throw new Error('Domain parameter is required');
    }

    try {
      const resolution = await this.domainResolver.resolveTenantFromDomain(domain);

      return {
        success: true,
        domain,
        tenant: {
          id: resolution.tenant.id,
          slug: resolution.tenant.slug,
          name: resolution.tenant.name,
          status: resolution.tenant.status,
        },
        resolvedBy: resolution.resolvedBy,
        tenantDomain: resolution.domain ? {
          id: resolution.domain.id,
          domain: resolution.domain.domain,
          type: resolution.domain.type,
          isPrimary: resolution.domain.isPrimary,
          isVerified: resolution.domain.isVerified,
        } : null,
      };
    } catch (error) {
      return {
        success: false,
        domain,
        error: error.message,
      };
    }
  }

  @Post('verify/:domainId')
  @ApiOperation({ summary: 'Verify domain ownership' })
  @ApiParam({ name: 'domainId', description: 'Domain ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Domain verification initiated',
  })
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  async verifyDomain(
    @CurrentTenant() tenantId: number,
    @Param('domainId') domainId: number,
  ): Promise<{ status: string; message: string; verificationToken?: string }> {
    // Implementation would go here - domain verification process
    // This could involve DNS TXT record verification, file upload verification, etc.
    // For now, return placeholder response
    return {
      status: 'pending',
      message: 'Domain verification process initiated',
      verificationToken: `softellio-verify-${Date.now()}`,
    };
  }

  @Get('netlify-config')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.GONE)
  async getNetlifyConfigDeprecated() {
    return {
      statusCode: 410,
      error: 'Gone',
      message: 'This endpoint has been permanently removed. Softellio now uses Vercel for deployments.',
      details: {
        deprecated: 'GET /domains/netlify-config',
        reason: 'Netlify is no longer supported. All deployments now use Vercel.',
        migration: 'Configure domains directly in Vercel dashboard: https://vercel.com/docs/concepts/projects/custom-domains',
        documentation: 'https://docs.softellio.com/domains/vercel-setup'
      },
      timestamp: new Date().toISOString()
    };
  }
}