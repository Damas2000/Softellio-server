"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersSlidersController = void 0;
const common_1 = require("@nestjs/common");
const banners_sliders_service_1 = require("./banners-sliders.service");
const banner_slider_dto_1 = require("./dto/banner-slider.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let BannersSlidersController = class BannersSlidersController {
    constructor(bannersSlidersService) {
        this.bannersSlidersService = bannersSlidersService;
    }
    async getPublicSlider(key, tenantId) {
        try {
            const slider = await this.bannersSlidersService.getSliderByKey(key, tenantId);
            if (!slider || !slider.isActive) {
                throw new common_1.HttpException('Slider not found or inactive', common_1.HttpStatus.NOT_FOUND);
            }
            await this.bannersSlidersService.trackSliderView(slider.id);
            return {
                success: true,
                data: slider,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get slider', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPublicBanners(position, tenantId) {
        try {
            const banners = await this.bannersSlidersService.getBannersByPosition(position, tenantId);
            for (const banner of banners) {
                await this.bannersSlidersService.trackBannerView(banner.id);
            }
            return {
                success: true,
                data: banners,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get banners', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackBannerClick(bannerId) {
        try {
            await this.bannersSlidersService.trackBannerClick(bannerId);
            return { success: true };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track click', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackSliderClick(sliderId) {
        try {
            await this.bannersSlidersService.trackSliderClick(sliderId);
            return { success: true };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track click', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllSliders(tenantId, query) {
        try {
            const sliders = await this.bannersSlidersService.getAllSliders(tenantId, query);
            return {
                success: true,
                data: sliders,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get sliders', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSliderById(id, tenantId) {
        try {
            const slider = await this.bannersSlidersService.getSliderById(id, tenantId);
            return {
                success: true,
                data: slider,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get slider', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createSlider(createSliderDto, tenantId) {
        try {
            const slider = await this.bannersSlidersService.createSlider(createSliderDto, tenantId);
            return {
                success: true,
                message: 'Slider created successfully',
                data: slider,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create slider', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateSlider(id, updateSliderDto, tenantId) {
        try {
            const slider = await this.bannersSlidersService.updateSlider(id, updateSliderDto, tenantId);
            return {
                success: true,
                message: 'Slider updated successfully',
                data: slider,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update slider', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteSlider(id, tenantId) {
        try {
            await this.bannersSlidersService.deleteSlider(id, tenantId);
            return {
                success: true,
                message: 'Slider deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete slider', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async toggleSliderStatus(id, tenantId) {
        try {
            const slider = await this.bannersSlidersService.toggleSliderStatus(id, tenantId);
            return {
                success: true,
                message: 'Slider status updated successfully',
                data: slider,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update slider status', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSliderItems(sliderId, tenantId) {
        try {
            const items = await this.bannersSlidersService.getSliderItems(sliderId, tenantId);
            return {
                success: true,
                data: items,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get slider items', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSliderItem(sliderId, createSliderItemDto, tenantId) {
        try {
            const item = await this.bannersSlidersService.createSliderItem(sliderId, createSliderItemDto, tenantId);
            return {
                success: true,
                message: 'Slider item created successfully',
                data: item,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create slider item', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateSliderItem(id, updateSliderItemDto, tenantId) {
        try {
            const item = await this.bannersSlidersService.updateSliderItem(id, updateSliderItemDto, tenantId);
            return {
                success: true,
                message: 'Slider item updated successfully',
                data: item,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update slider item', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteSliderItem(id, tenantId) {
        try {
            await this.bannersSlidersService.deleteSliderItem(id, tenantId);
            return {
                success: true,
                message: 'Slider item deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete slider item', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateSliderItemOrder(id, newOrder, tenantId) {
        try {
            const item = await this.bannersSlidersService.updateSliderItemOrder(id, newOrder, tenantId);
            return {
                success: true,
                message: 'Slider item order updated successfully',
                data: item,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update slider item order', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAllBannerPositions(tenantId) {
        try {
            const positions = await this.bannersSlidersService.getAllBannerPositions(tenantId);
            return {
                success: true,
                data: positions,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get banner positions', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createBannerPosition(createBannerPositionDto, tenantId) {
        try {
            const position = await this.bannersSlidersService.createBannerPosition(createBannerPositionDto, tenantId);
            return {
                success: true,
                message: 'Banner position created successfully',
                data: position,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create banner position', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateBannerPosition(id, updateBannerPositionDto, tenantId) {
        try {
            const position = await this.bannersSlidersService.updateBannerPosition(id, updateBannerPositionDto, tenantId);
            return {
                success: true,
                message: 'Banner position updated successfully',
                data: position,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update banner position', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteBannerPosition(id, tenantId) {
        try {
            await this.bannersSlidersService.deleteBannerPosition(id, tenantId);
            return {
                success: true,
                message: 'Banner position deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete banner position', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAllBanners(tenantId, query) {
        try {
            const banners = await this.bannersSlidersService.getAllBanners(tenantId, query);
            return {
                success: true,
                data: banners,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get banners', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createBannerAssignment(createAssignmentDto, tenantId) {
        try {
            const assignment = await this.bannersSlidersService.createBannerPositionAssignment(createAssignmentDto, tenantId);
            return {
                success: true,
                message: 'Banner assignment created successfully',
                data: assignment,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create banner assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateBannerAssignment(id, updateAssignmentDto, tenantId) {
        try {
            const assignment = await this.bannersSlidersService.updateBannerPositionAssignment(id, updateAssignmentDto, tenantId);
            return {
                success: true,
                message: 'Banner assignment updated successfully',
                data: assignment,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update banner assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteBannerAssignment(id, tenantId) {
        try {
            await this.bannersSlidersService.deleteBannerPositionAssignment(id, tenantId);
            return {
                success: true,
                message: 'Banner assignment deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete banner assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSliderAnalytics(id, tenantId, startDate, endDate) {
        try {
            const analytics = await this.bannersSlidersService.getSliderAnalytics(id, tenantId, startDate, endDate);
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get slider analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBannerAnalytics(id, tenantId, startDate, endDate) {
        try {
            const analytics = await this.bannersSlidersService.getBannerAnalytics(tenantId);
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get banner analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BannersSlidersController = BannersSlidersController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/sliders/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getPublicSlider", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/banners/:position'),
    __param(0, (0, common_1.Param)('position')),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getPublicBanners", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/banner/:id/click'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "trackBannerClick", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/slider/:id/click'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "trackSliderClick", null);
__decorate([
    (0, common_1.Get)('admin/sliders'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.SliderQueryDto]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getAllSliders", null);
__decorate([
    (0, common_1.Get)('admin/sliders/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getSliderById", null);
__decorate([
    (0, common_1.Post)('admin/sliders'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [banner_slider_dto_1.CreateSliderDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "createSlider", null);
__decorate([
    (0, common_1.Put)('admin/sliders/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.UpdateSliderDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "updateSlider", null);
__decorate([
    (0, common_1.Delete)('admin/sliders/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "deleteSlider", null);
__decorate([
    (0, common_1.Patch)('admin/sliders/:id/toggle'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "toggleSliderStatus", null);
__decorate([
    (0, common_1.Get)('admin/sliders/:sliderId/items'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('sliderId', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getSliderItems", null);
__decorate([
    (0, common_1.Post)('admin/sliders/:sliderId/items'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('sliderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.CreateSliderItemDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "createSliderItem", null);
__decorate([
    (0, common_1.Put)('admin/slider-items/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.UpdateSliderItemDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "updateSliderItem", null);
__decorate([
    (0, common_1.Delete)('admin/slider-items/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "deleteSliderItem", null);
__decorate([
    (0, common_1.Patch)('admin/slider-items/:id/order'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('newOrder', common_1.ParseIntPipe)),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "updateSliderItemOrder", null);
__decorate([
    (0, common_1.Get)('admin/banner-positions'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getAllBannerPositions", null);
__decorate([
    (0, common_1.Post)('admin/banner-positions'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [banner_slider_dto_1.CreateBannerPositionDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "createBannerPosition", null);
__decorate([
    (0, common_1.Put)('admin/banner-positions/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.UpdateBannerPositionDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "updateBannerPosition", null);
__decorate([
    (0, common_1.Delete)('admin/banner-positions/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "deleteBannerPosition", null);
__decorate([
    (0, common_1.Get)('admin/banners'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.BannerQueryDto]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getAllBanners", null);
__decorate([
    (0, common_1.Post)('admin/banner-assignments'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [banner_slider_dto_1.CreateBannerPositionAssignmentDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "createBannerAssignment", null);
__decorate([
    (0, common_1.Put)('admin/banner-assignments/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, banner_slider_dto_1.UpdateBannerPositionAssignmentDto, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "updateBannerAssignment", null);
__decorate([
    (0, common_1.Delete)('admin/banner-assignments/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "deleteBannerAssignment", null);
__decorate([
    (0, common_1.Get)('admin/analytics/sliders/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getSliderAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/analytics/banners/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], BannersSlidersController.prototype, "getBannerAnalytics", null);
exports.BannersSlidersController = BannersSlidersController = __decorate([
    (0, common_1.Controller)('banners-sliders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, tenant_guard_1.TenantGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [banners_sliders_service_1.BannersSlidersService])
], BannersSlidersController);
//# sourceMappingURL=banners-sliders.controller.js.map