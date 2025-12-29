import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from '../tenants/tenants.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('tenants')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all tenants (SUPER_ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all tenants',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tenantId: { type: 'number', example: 1 },
          companyName: { type: 'string', example: 'Demo Company' },
          domain: { type: 'string', example: 'demo.softellio.com' },
          slug: { type: 'string', example: 'demo-company' },
          status: { type: 'string', example: 'active' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN only' })
  async getAllTenants() {
    const tenants = await this.tenantsService.findAll();

    // Transform to match the required format
    return tenants.map(tenant => ({
      tenantId: tenant.id,
      companyName: tenant.name,
      domain: tenant.domain,
      slug: tenant.slug,
      status: tenant.status
    }));
  }
}