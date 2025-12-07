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
} from '@nestjs/common';
import { BannersSlidersService } from './banners-sliders.service';
import {
  CreateSliderDto,
  UpdateSliderDto,
  CreateSliderItemDto,
  UpdateSliderItemDto,
  CreateBannerPositionDto,
  UpdateBannerPositionDto,
  CreateBannerPositionAssignmentDto,
  UpdateBannerPositionAssignmentDto,
  SliderQueryDto,
  BannerQueryDto,
} from './dto/banner-slider.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('banners-sliders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class BannersSlidersController {
  constructor(private readonly bannersSlidersService: BannersSlidersService) {}

  // =================== PUBLIC ROUTES ===================

  @Public()
  @Get('public/sliders/:key')
  async getPublicSlider(
    @Param('key') key: string,
    @Query('tenantId', ParseIntPipe) tenantId: number,
  ) {
    try {
      const slider = await this.bannersSlidersService.getSliderByKey(key, tenantId);

      if (!slider || !slider.isActive) {
        throw new HttpException('Slider not found or inactive', HttpStatus.NOT_FOUND);
      }

      // Track view
      await this.bannersSlidersService.trackSliderView(slider.id);

      return {
        success: true,
        data: slider,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get slider',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('public/banners/:position')
  async getPublicBanners(
    @Param('position') position: string,
    @Query('tenantId', ParseIntPipe) tenantId: number,
  ) {
    try {
      const banners = await this.bannersSlidersService.getBannersByPosition(position, tenantId);

      // Track views for all banners
      for (const banner of banners) {
        await this.bannersSlidersService.trackBannerView(banner.id);
      }

      return {
        success: true,
        data: banners,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get banners',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('public/track/banner/:id/click')
  async trackBannerClick(
    @Param('id', ParseIntPipe) bannerId: number,
  ) {
    try {
      await this.bannersSlidersService.trackBannerClick(bannerId);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        'Failed to track click',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('public/track/slider/:id/click')
  async trackSliderClick(
    @Param('id', ParseIntPipe) sliderId: number,
  ) {
    try {
      await this.bannersSlidersService.trackSliderClick(sliderId);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        'Failed to track click',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ADMIN ROUTES - SLIDERS ===================

  @Get('admin/sliders')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllSliders(
    @CurrentTenant() tenantId: number,
    @Query() query: SliderQueryDto,
  ) {
    try {
      const sliders = await this.bannersSlidersService.getAllSliders(tenantId, query);
      return {
        success: true,
        data: sliders,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get sliders',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/sliders/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSliderById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const slider = await this.bannersSlidersService.getSliderById(id, tenantId);
      return {
        success: true,
        data: slider,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get slider',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('admin/sliders')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createSlider(
    @Body() createSliderDto: CreateSliderDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const slider = await this.bannersSlidersService.createSlider(createSliderDto, tenantId);
      return {
        success: true,
        message: 'Slider created successfully',
        data: slider,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create slider',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/sliders/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateSlider(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSliderDto: UpdateSliderDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const slider = await this.bannersSlidersService.updateSlider(id, updateSliderDto, tenantId);
      return {
        success: true,
        message: 'Slider updated successfully',
        data: slider,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update slider',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/sliders/:id')
  @Roles('TENANT_ADMIN')
  async deleteSlider(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.bannersSlidersService.deleteSlider(id, tenantId);
      return {
        success: true,
        message: 'Slider deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete slider',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('admin/sliders/:id/toggle')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async toggleSliderStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const slider = await this.bannersSlidersService.toggleSliderStatus(id, tenantId);
      return {
        success: true,
        message: 'Slider status updated successfully',
        data: slider,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update slider status',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - SLIDER ITEMS ===================

  @Get('admin/sliders/:sliderId/items')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSliderItems(
    @Param('sliderId', ParseIntPipe) sliderId: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const items = await this.bannersSlidersService.getSliderItems(sliderId, tenantId);
      return {
        success: true,
        data: items,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get slider items',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/sliders/:sliderId/items')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createSliderItem(
    @Param('sliderId', ParseIntPipe) sliderId: number,
    @Body() createSliderItemDto: CreateSliderItemDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const item = await this.bannersSlidersService.createSliderItem(
        sliderId,
        createSliderItemDto,
        tenantId,
      );
      return {
        success: true,
        message: 'Slider item created successfully',
        data: item,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create slider item',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/slider-items/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateSliderItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSliderItemDto: UpdateSliderItemDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const item = await this.bannersSlidersService.updateSliderItem(id, updateSliderItemDto, tenantId);
      return {
        success: true,
        message: 'Slider item updated successfully',
        data: item,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update slider item',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/slider-items/:id')
  @Roles('TENANT_ADMIN')
  async deleteSliderItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.bannersSlidersService.deleteSliderItem(id, tenantId);
      return {
        success: true,
        message: 'Slider item deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete slider item',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('admin/slider-items/:id/order')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateSliderItemOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('newOrder', ParseIntPipe) newOrder: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const item = await this.bannersSlidersService.updateSliderItemOrder(id, newOrder, tenantId);
      return {
        success: true,
        message: 'Slider item order updated successfully',
        data: item,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update slider item order',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - BANNER POSITIONS ===================

  @Get('admin/banner-positions')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllBannerPositions(
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const positions = await this.bannersSlidersService.getAllBannerPositions(tenantId);
      return {
        success: true,
        data: positions,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get banner positions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/banner-positions')
  @Roles('TENANT_ADMIN')
  async createBannerPosition(
    @Body() createBannerPositionDto: CreateBannerPositionDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const position = await this.bannersSlidersService.createBannerPosition(
        createBannerPositionDto,
        tenantId,
      );
      return {
        success: true,
        message: 'Banner position created successfully',
        data: position,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create banner position',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/banner-positions/:id')
  @Roles('TENANT_ADMIN')
  async updateBannerPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerPositionDto: UpdateBannerPositionDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const position = await this.bannersSlidersService.updateBannerPosition(
        id,
        updateBannerPositionDto,
        tenantId,
      );
      return {
        success: true,
        message: 'Banner position updated successfully',
        data: position,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update banner position',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/banner-positions/:id')
  @Roles('TENANT_ADMIN')
  async deleteBannerPosition(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.bannersSlidersService.deleteBannerPosition(id, tenantId);
      return {
        success: true,
        message: 'Banner position deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete banner position',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ADMIN ROUTES - BANNER ASSIGNMENTS ===================

  @Get('admin/banners')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getAllBanners(
    @CurrentTenant() tenantId: number,
    @Query() query: BannerQueryDto,
  ) {
    try {
      const banners = await this.bannersSlidersService.getAllBanners(tenantId, query);
      return {
        success: true,
        data: banners,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get banners',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/banner-assignments')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async createBannerAssignment(
    @Body() createAssignmentDto: CreateBannerPositionAssignmentDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const assignment = await this.bannersSlidersService.createBannerPositionAssignment(
        createAssignmentDto,
        tenantId,
      );
      return {
        success: true,
        message: 'Banner assignment created successfully',
        data: assignment,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create banner assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('admin/banner-assignments/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async updateBannerAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateBannerPositionAssignmentDto,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      const assignment = await this.bannersSlidersService.updateBannerPositionAssignment(
        id,
        updateAssignmentDto,
        tenantId,
      );
      return {
        success: true,
        message: 'Banner assignment updated successfully',
        data: assignment,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update banner assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('admin/banner-assignments/:id')
  @Roles('TENANT_ADMIN')
  async deleteBannerAssignment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    try {
      await this.bannersSlidersService.deleteBannerPositionAssignment(id, tenantId);
      return {
        success: true,
        message: 'Banner assignment deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete banner assignment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =================== ANALYTICS ROUTES ===================

  @Get('admin/analytics/sliders/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getSliderAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const analytics = await this.bannersSlidersService.getSliderAnalytics(
        id,
        tenantId,
        startDate,
        endDate,
      );
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get slider analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin/analytics/banners/:id')
  @Roles('TENANT_ADMIN', 'EDITOR')
  async getBannerAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const analytics = await this.bannersSlidersService.getBannerAnalytics(tenantId);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get banner analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}