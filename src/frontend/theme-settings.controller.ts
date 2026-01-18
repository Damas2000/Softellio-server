import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThemeSettingsService } from './theme-settings.service';
import { UpdateThemeSettingDto, ThemeSettingResponseDto } from './dto/theme-setting.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Theme Settings')
@Controller('theme-settings')
export class ThemeSettingsController {
  constructor(private readonly themeSettingsService: ThemeSettingsService) {}

  // ==================== ADMIN ROUTES ====================

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get theme settings (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Theme settings retrieved successfully',
    type: ThemeSettingResponseDto,
  })
  async getThemeSettings(@CurrentTenant() tenantId: number) {
    return await this.themeSettingsService.getOrCreateThemeSetting(tenantId);
  }

  @Put('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update theme settings (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Theme settings updated successfully',
    type: ThemeSettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid theme setting values' })
  async updateThemeSettings(
    @CurrentTenant() tenantId: number,
    @Body() updateDto: UpdateThemeSettingDto,
  ) {
    return await this.themeSettingsService.updateThemeSetting(tenantId, updateDto);
  }

  @Post('admin/reset')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Reset theme settings to defaults (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Theme settings reset to defaults successfully',
    type: ThemeSettingResponseDto,
  })
  async resetThemeSettings(@CurrentTenant() tenantId: number) {
    return await this.themeSettingsService.resetThemeSetting(tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public theme settings' })
  @ApiResponse({
    status: 200,
    description: 'Public theme settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        primaryColor: { type: 'string', example: '#3B82F6' },
        secondaryColor: { type: 'string', example: '#6B7280' },
        backgroundColor: { type: 'string', example: '#FFFFFF' },
        textColor: { type: 'string', example: '#111827' },
        fontFamily: { type: 'string', example: 'Inter, sans-serif' },
        radius: { type: 'number', example: 8 },
        shadowLevel: { type: 'number', example: 1 },
        containerMaxWidth: { type: 'number', example: 1200 },
        gridGap: { type: 'number', example: 24 },
        buttonStyle: { type: 'string', example: 'solid' },
        headerVariant: { type: 'string', example: 'default' },
        footerVariant: { type: 'string', example: 'default' },
      },
    },
  })
  async getPublicThemeSettings(@CurrentTenant() tenantId: number) {
    return await this.themeSettingsService.getPublicThemeSetting(tenantId);
  }
}