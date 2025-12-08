import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants (Public)')
@Controller('tenants')
export class TenantsPublicController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get('by-domain')
  @ApiOperation({
    summary: 'Get tenant information by domain',
    description: 'Resolves tenant information from domain/subdomain for frontend usage'
  })
  @ApiQuery({
    name: 'host',
    description: 'Domain to resolve (e.g., tekbaski.softellio.com)',
    example: 'tekbaski.softellio.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant information found',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'number', example: 1 },
        companyName: { type: 'string', example: 'Tek Baskı Reklam' },
        slug: { type: 'string', example: 'tekbaski' },
        plan: { type: 'string', example: 'basic' },
        siteDomain: { type: 'string', example: 'tekbaski.softellio.com' },
        panelDomain: { type: 'string', example: 'tekbaski-panel.softellio.com' },
        templateKey: { type: 'string', example: 'default' },
        status: { type: 'string', example: 'active' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'No tenant found for this domain'
  })
  async getByDomain(@Query('host') host: string) {
    if (!host) {
      throw new NotFoundException('Host parameter is required');
    }

    const tenant = await this.tenantsService.findByDomain(host);

    if (!tenant) {
      throw new NotFoundException(`No tenant found for domain: ${host}`);
    }

    // Return data in the format specified in the document
    return {
      tenantId: tenant.id,
      companyName: tenant.name,
      slug: tenant.slug,
      plan: 'basic', // Default plan since not in current schema
      siteDomain: `${tenant.slug}.softellio.com`,
      panelDomain: `${tenant.slug}-panel.softellio.com`,
      templateKey: tenant.theme || 'default',
      status: tenant.status
    };
  }
}