import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpException,
  Patch,
  Req,
  Ip,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { SocialMediaMapsService } from './social-media-maps.service';
import {
  CreateSocialMediaLinkDto,
  UpdateSocialMediaLinkDto,
  CreateMapConfigurationDto,
  UpdateMapConfigurationDto,
  CreateLocationCategoryDto,
  UpdateLocationCategoryDto,
  CreateLocationAssignmentDto,
  UpdateLocationAssignmentDto,
  CreateSocialMediaAnalyticsDto,
  CreateSocialMediaShareDto,
  SocialMediaQueryDto,
  MapQueryDto,
  LocationQueryDto,
  AnalyticsQueryDto,
  ShareAnalyticsQueryDto,
  UpdateOfficeDto,
  PublicMapConfigDto,
  PublicSocialLinksDto,
} from './dto/social-media-maps.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('social-media-maps')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SocialMediaMapsController {
  constructor(private readonly socialMediaMapsService: SocialMediaMapsService) {}

  // =================== PUBLIC ROUTES ===================

  @Public()
  @Get('public/social-links')
  async getPublicSocialLinks(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Query() query: PublicSocialLinksDto,
  ) {
    try {
      const links = await this.socialMediaMapsService.getPublicSocialMediaLinks(tenantId, query);
      return {
        success: true,
        data: links,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get social links',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('public/maps/:mapKey')
  async getPublicMapConfiguration(
    @Param('mapKey') mapKey: string,
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Query('language') language?: string,
  ) {
    try {
      const mapConfig = await this.socialMediaMapsService.getPublicMapConfiguration(tenantId, {
        mapKey,
        language,
      });
      return {
        success: true,
        data: mapConfig,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get map configuration',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Public()
  @Post('public/track/social-click/:id')
  async trackSocialClick(
    @Param('id', ParseIntPipe) linkId: number,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referrer?: string,
  ) {
    try {
      await this.socialMediaMapsService.trackSocialMediaClick(linkId, ipAddress, userAgent, referrer);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        'Failed to track click',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('public/track/share')
  async trackSocialShare(
    @Body() createDto: CreateSocialMediaShareDto,
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referrer?: string,
  ) {
    try {
      const shareData = {
        ...createDto,
        ipAddress,
        userAgent,
        referrer,
      };
      const share = await this.socialMediaMapsService.recordSocialMediaShare(shareData, tenantId);
      return {
        success: true,
        data: share,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to track share',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - SOCIAL MEDIA LINKS ===================

  @Get('admin/social-links')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllSocialMediaLinks(
    @CurrentTenant() tenantId: number,
    @Query() query: SocialMediaQueryDto,
  ) {
    try {
      const result = await this.socialMediaMapsService.getAllSocialMediaLinks(tenantId, query);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get social media links',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/social-links/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSocialMediaLinkById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const link = await this.socialMediaMapsService.getSocialMediaLinkById(id, tenantId);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get social media link',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('admin/social-links')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createSocialMediaLink(
    @Body() createDto: CreateSocialMediaLinkDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const link = await this.socialMediaMapsService.createSocialMediaLink(createDto, tenantId);
      return {
        success: true,
        message: 'Social media link created successfully',
        data: link,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create social media link',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/social-links/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateSocialMediaLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSocialMediaLinkDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const link = await this.socialMediaMapsService.updateSocialMediaLink(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Social media link updated successfully',
        data: link,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update social media link',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/social-links/:id')
  @Roles('TENANT_ADMIN')
  async deleteSocialMediaLink(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.socialMediaMapsService.deleteSocialMediaLink(id, tenantId);
      return {
        success: true,
        message: 'Social media link deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete social media link',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - MAP CONFIGURATIONS ===================

  @Get('admin/maps')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllMapConfigurations(
    @CurrentTenant() tenantId: number,
    @Query() query: MapQueryDto,
  ) {
    try {
      const result = await this.socialMediaMapsService.getAllMapConfigurations(tenantId, query);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get map configurations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/maps/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getMapConfigurationById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const config = await this.socialMediaMapsService.getMapConfigurationById(id, tenantId);
      return {
        success: true,
        data: config,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get map configuration',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('admin/maps')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createMapConfiguration(
    @Body() createDto: CreateMapConfigurationDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const config = await this.socialMediaMapsService.createMapConfiguration(createDto, tenantId);
      return {
        success: true,
        message: 'Map configuration created successfully',
        data: config,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create map configuration',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/maps/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateMapConfiguration(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMapConfigurationDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const config = await this.socialMediaMapsService.updateMapConfiguration(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Map configuration updated successfully',
        data: config,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update map configuration',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/maps/:id')
  @Roles('TENANT_ADMIN')
  async deleteMapConfiguration(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.socialMediaMapsService.deleteMapConfiguration(id, tenantId);
      return {
        success: true,
        message: 'Map configuration deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete map configuration',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - LOCATION CATEGORIES ===================

  @Get('admin/location-categories')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllLocationCategories(
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const categories = await this.socialMediaMapsService.getAllLocationCategories(tenantId);
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get location categories',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/location-categories/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getLocationCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const category = await this.socialMediaMapsService.getLocationCategoryById(id, tenantId);
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get location category',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('admin/location-categories')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createLocationCategory(
    @Body() createDto: CreateLocationCategoryDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const category = await this.socialMediaMapsService.createLocationCategory(createDto, tenantId);
      return {
        success: true,
        message: 'Location category created successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create location category',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/location-categories/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateLocationCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLocationCategoryDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const category = await this.socialMediaMapsService.updateLocationCategory(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Location category updated successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update location category',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/location-categories/:id')
  @Roles('TENANT_ADMIN')
  async deleteLocationCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.socialMediaMapsService.deleteLocationCategory(id, tenantId);
      return {
        success: true,
        message: 'Location category deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete location category',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - LOCATION ASSIGNMENTS ===================

  @Get('admin/location-assignments')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getLocationAssignments(
    @CurrentTenant() tenantId: number,
    @Query() query: LocationQueryDto,
  ) {
    try {
      const assignments = await this.socialMediaMapsService.getLocationAssignments(tenantId, query);
      return {
        success: true,
        data: assignments,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get location assignments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/location-assignments')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createLocationAssignment(
    @Body() createDto: CreateLocationAssignmentDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const assignment = await this.socialMediaMapsService.createLocationAssignment(createDto, tenantId);
      return {
        success: true,
        message: 'Location assignment created successfully',
        data: assignment,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create location assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/location-assignments/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateLocationAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLocationAssignmentDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const assignment = await this.socialMediaMapsService.updateLocationAssignment(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Location assignment updated successfully',
        data: assignment,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update location assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/location-assignments/:id')
  @Roles('TENANT_ADMIN')
  async deleteLocationAssignment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.socialMediaMapsService.deleteLocationAssignment(id, tenantId);
      return {
        success: true,
        message: 'Location assignment deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete location assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - OFFICE MANAGEMENT ===================

  @Put('admin/offices/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateOffice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOfficeDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const office = await this.socialMediaMapsService.updateOffice(id, updateDto, tenantId);
      return {
        success: true,
        message: 'Office updated successfully',
        data: office,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update office',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ANALYTICS ROUTES ===================

  @Post('admin/analytics/social')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async recordSocialMediaAnalytics(
    @Body() createDto: CreateSocialMediaAnalyticsDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const analytics = await this.socialMediaMapsService.recordSocialMediaAnalytics(createDto, tenantId);
      return {
        success: true,
        message: 'Analytics recorded successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to record analytics',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('admin/analytics/social')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSocialMediaAnalytics(
    @CurrentTenant() tenantId: number,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const analytics = await this.socialMediaMapsService.getSocialMediaAnalytics(tenantId, query);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/analytics/shares')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSocialMediaShares(
    @CurrentTenant() tenantId: number,
    @Query() query: ShareAnalyticsQueryDto,
  ) {
    try {
      const shares = await this.socialMediaMapsService.getSocialMediaShares(tenantId, query);
      return {
        success: true,
        data: shares,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get shares analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== UTILITY ROUTES ===================

  @Get('admin/platforms')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSupportedPlatforms() {
    const platforms = [
      { value: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2' },
      { value: 'twitter', label: 'Twitter/X', icon: 'fab fa-twitter', color: '#1DA1F2' },
      { value: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F' },
      { value: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0077B5' },
      { value: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
      { value: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366' },
      { value: 'telegram', label: 'Telegram', icon: 'fab fa-telegram-plane', color: '#0088CC' },
      { value: 'pinterest', label: 'Pinterest', icon: 'fab fa-pinterest-p', color: '#BD081C' },
      { value: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
      { value: 'snapchat', label: 'Snapchat', icon: 'fab fa-snapchat-ghost', color: '#FFFC00' },
    ];

    return {
      success: true,
      data: platforms,
    };
  }

  @Get('admin/map-providers')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSupportedMapProviders() {
    const providers = [
      {
        value: 'google',
        label: 'Google Maps',
        features: ['Street View', 'Directions', 'Satellite View', 'Traffic'],
        requiresApiKey: true,
      },
      {
        value: 'openstreet',
        label: 'OpenStreetMap',
        features: ['Open Source', 'Free', 'Community Driven'],
        requiresApiKey: false,
      },
      {
        value: 'mapbox',
        label: 'Mapbox',
        features: ['Custom Styling', 'Vector Maps', 'High Performance'],
        requiresApiKey: true,
      },
    ];

    return {
      success: true,
      data: providers,
    };
  }
}