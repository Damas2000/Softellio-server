import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-tenant.decorator';
import { Role, ModuleName } from '@prisma/client';

@ApiTags('Tenants (Super Admin)')
@Controller('super-admin/tenants')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Tenant with domain already exists' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'List of all tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle tenant active status' })
  @ApiResponse({ status: 200, description: 'Tenant status updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.remove(id);
  }

  @Get(':id/features')
  @ApiOperation({ summary: 'Get tenant features' })
  @ApiResponse({ status: 200, description: 'Tenant features' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  getFeatures(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.getFeatures(id);
  }

  @Patch(':id/features/:module')
  @ApiOperation({ summary: 'Update tenant feature' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Param('module', new ParseEnumPipe(ModuleName)) module: ModuleName,
    @Body() body: { enabled: boolean },
  ) {
    return this.tenantsService.updateFeature(id, module, body.enabled);
  }

  @Post(':id/impersonate')
  @ApiOperation({ summary: 'Generate impersonation token for tenant' })
  @ApiResponse({ status: 200, description: 'Impersonation token generated' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  impersonate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.generateImpersonationToken(id, user.id);
  }
}