import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UpdateThemeSettingDto } from './dto/theme-setting.dto';

@Injectable()
export class ThemeSettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get theme settings for tenant, create with defaults if missing
   */
  async getOrCreateThemeSetting(tenantId: number) {
    let themeSetting = await this.prisma.themeSetting.findUnique({
      where: { tenantId }
    });

    if (!themeSetting) {
      // Create with defaults if missing
      themeSetting = await this.prisma.themeSetting.create({
        data: { tenantId }
      });
    }

    return themeSetting;
  }

  /**
   * Update theme settings for tenant
   */
  async updateThemeSetting(tenantId: number, updateDto: UpdateThemeSettingDto) {
    // Ensure theme setting exists
    await this.getOrCreateThemeSetting(tenantId);

    // Update the theme setting
    const updated = await this.prisma.themeSetting.update({
      where: { tenantId },
      data: updateDto
    });

    return updated;
  }

  /**
   * Reset theme settings to defaults
   */
  async resetThemeSetting(tenantId: number) {
    // Delete existing and create new with defaults
    await this.prisma.themeSetting.delete({
      where: { tenantId }
    }).catch(() => {
      // Ignore if doesn't exist
    });

    const newThemeSetting = await this.prisma.themeSetting.create({
      data: { tenantId }
    });

    return newThemeSetting;
  }

  /**
   * Get public theme settings (no auth required)
   */
  async getPublicThemeSetting(tenantId: number | null) {
    // Return defaults for SUPER_ADMIN context (null tenantId)
    if (tenantId === null) {
      return {
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter, sans-serif',
        radius: 8,
        shadowLevel: 1,
        containerMaxWidth: 1200,
        gridGap: 24,
        buttonStyle: 'solid',
        headerVariant: 'default',
        footerVariant: 'default',
      };
    }

    const themeSetting = await this.prisma.themeSetting.findUnique({
      where: { tenantId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        radius: true,
        shadowLevel: true,
        containerMaxWidth: true,
        gridGap: true,
        buttonStyle: true,
        headerVariant: true,
        footerVariant: true,
      }
    });

    // Return defaults if not found
    if (!themeSetting) {
      return {
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter, sans-serif',
        radius: 8,
        shadowLevel: 1,
        containerMaxWidth: 1200,
        gridGap: 24,
        buttonStyle: 'solid',
        headerVariant: 'default',
        footerVariant: 'default',
      };
    }

    return themeSetting;
  }
}