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
exports.SocialMediaMapsController = void 0;
const common_1 = require("@nestjs/common");
const social_media_maps_service_1 = require("./social-media-maps.service");
const social_media_maps_dto_1 = require("./dto/social-media-maps.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let SocialMediaMapsController = class SocialMediaMapsController {
    constructor(socialMediaMapsService) {
        this.socialMediaMapsService = socialMediaMapsService;
    }
    async getPublicSocialLinks(tenantId, query) {
        try {
            const links = await this.socialMediaMapsService.getPublicSocialMediaLinks(tenantId, query);
            return {
                success: true,
                data: links,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get social links', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPublicMapConfiguration(mapKey, tenantId, language) {
        try {
            const mapConfig = await this.socialMediaMapsService.getPublicMapConfiguration(tenantId, {
                mapKey,
                language,
            });
            return {
                success: true,
                data: mapConfig,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get map configuration', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async trackSocialClick(linkId, ipAddress, userAgent, referrer) {
        try {
            await this.socialMediaMapsService.trackSocialMediaClick(linkId, ipAddress, userAgent, referrer);
            return { success: true };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track click', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackSocialShare(createDto, tenantId, ipAddress, userAgent, referrer) {
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
        }
        catch (error) {
            throw new common_1.HttpException('Failed to track share', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllSocialMediaLinks(tenantId, query) {
        try {
            const result = await this.socialMediaMapsService.getAllSocialMediaLinks(tenantId, query);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get social media links', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSocialMediaLinkById(id, tenantId) {
        try {
            const link = await this.socialMediaMapsService.getSocialMediaLinkById(id, tenantId);
            return {
                success: true,
                data: link,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get social media link', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createSocialMediaLink(createDto, tenantId) {
        try {
            const link = await this.socialMediaMapsService.createSocialMediaLink(createDto, tenantId);
            return {
                success: true,
                message: 'Social media link created successfully',
                data: link,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create social media link', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateSocialMediaLink(id, updateDto, tenantId) {
        try {
            const link = await this.socialMediaMapsService.updateSocialMediaLink(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Social media link updated successfully',
                data: link,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update social media link', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteSocialMediaLink(id, tenantId) {
        try {
            await this.socialMediaMapsService.deleteSocialMediaLink(id, tenantId);
            return {
                success: true,
                message: 'Social media link deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete social media link', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAllMapConfigurations(tenantId, query) {
        try {
            const result = await this.socialMediaMapsService.getAllMapConfigurations(tenantId, query);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get map configurations', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMapConfigurationById(id, tenantId) {
        try {
            const config = await this.socialMediaMapsService.getMapConfigurationById(id, tenantId);
            return {
                success: true,
                data: config,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get map configuration', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createMapConfiguration(createDto, tenantId) {
        try {
            const config = await this.socialMediaMapsService.createMapConfiguration(createDto, tenantId);
            return {
                success: true,
                message: 'Map configuration created successfully',
                data: config,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create map configuration', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateMapConfiguration(id, updateDto, tenantId) {
        try {
            const config = await this.socialMediaMapsService.updateMapConfiguration(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Map configuration updated successfully',
                data: config,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update map configuration', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteMapConfiguration(id, tenantId) {
        try {
            await this.socialMediaMapsService.deleteMapConfiguration(id, tenantId);
            return {
                success: true,
                message: 'Map configuration deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete map configuration', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAllLocationCategories(tenantId) {
        try {
            const categories = await this.socialMediaMapsService.getAllLocationCategories(tenantId);
            return {
                success: true,
                data: categories,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get location categories', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLocationCategoryById(id, tenantId) {
        try {
            const category = await this.socialMediaMapsService.getLocationCategoryById(id, tenantId);
            return {
                success: true,
                data: category,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get location category', error.status || common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createLocationCategory(createDto, tenantId) {
        try {
            const category = await this.socialMediaMapsService.createLocationCategory(createDto, tenantId);
            return {
                success: true,
                message: 'Location category created successfully',
                data: category,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create location category', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateLocationCategory(id, updateDto, tenantId) {
        try {
            const category = await this.socialMediaMapsService.updateLocationCategory(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Location category updated successfully',
                data: category,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update location category', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteLocationCategory(id, tenantId) {
        try {
            await this.socialMediaMapsService.deleteLocationCategory(id, tenantId);
            return {
                success: true,
                message: 'Location category deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete location category', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getLocationAssignments(tenantId, query) {
        try {
            const assignments = await this.socialMediaMapsService.getLocationAssignments(tenantId, query);
            return {
                success: true,
                data: assignments,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get location assignments', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createLocationAssignment(createDto, tenantId) {
        try {
            const assignment = await this.socialMediaMapsService.createLocationAssignment(createDto, tenantId);
            return {
                success: true,
                message: 'Location assignment created successfully',
                data: assignment,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create location assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateLocationAssignment(id, updateDto, tenantId) {
        try {
            const assignment = await this.socialMediaMapsService.updateLocationAssignment(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Location assignment updated successfully',
                data: assignment,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update location assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteLocationAssignment(id, tenantId) {
        try {
            await this.socialMediaMapsService.deleteLocationAssignment(id, tenantId);
            return {
                success: true,
                message: 'Location assignment deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete location assignment', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateOffice(id, updateDto, tenantId) {
        try {
            const office = await this.socialMediaMapsService.updateOffice(id, updateDto, tenantId);
            return {
                success: true,
                message: 'Office updated successfully',
                data: office,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update office', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async recordSocialMediaAnalytics(createDto, tenantId) {
        try {
            const analytics = await this.socialMediaMapsService.recordSocialMediaAnalytics(createDto, tenantId);
            return {
                success: true,
                message: 'Analytics recorded successfully',
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to record analytics', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSocialMediaAnalytics(tenantId, query) {
        try {
            const analytics = await this.socialMediaMapsService.getSocialMediaAnalytics(tenantId, query);
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSocialMediaShares(tenantId, query) {
        try {
            const shares = await this.socialMediaMapsService.getSocialMediaShares(tenantId, query);
            return {
                success: true,
                data: shares,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get shares analytics', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
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
};
exports.SocialMediaMapsController = SocialMediaMapsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/social-links'),
    __param(0, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.PublicSocialLinksDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getPublicSocialLinks", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/maps/:mapKey'),
    __param(0, (0, common_1.Param)('mapKey')),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getPublicMapConfiguration", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/social-click/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('referer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "trackSocialClick", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('public/track/share'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Headers)('user-agent')),
    __param(4, (0, common_1.Headers)('referer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateSocialMediaShareDto, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "trackSocialShare", null);
__decorate([
    (0, common_1.Get)('admin/social-links'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.SocialMediaQueryDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getAllSocialMediaLinks", null);
__decorate([
    (0, common_1.Get)('admin/social-links/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getSocialMediaLinkById", null);
__decorate([
    (0, common_1.Post)('admin/social-links'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateSocialMediaLinkDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "createSocialMediaLink", null);
__decorate([
    (0, common_1.Put)('admin/social-links/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.UpdateSocialMediaLinkDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "updateSocialMediaLink", null);
__decorate([
    (0, common_1.Delete)('admin/social-links/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "deleteSocialMediaLink", null);
__decorate([
    (0, common_1.Get)('admin/maps'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.MapQueryDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getAllMapConfigurations", null);
__decorate([
    (0, common_1.Get)('admin/maps/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getMapConfigurationById", null);
__decorate([
    (0, common_1.Post)('admin/maps'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateMapConfigurationDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "createMapConfiguration", null);
__decorate([
    (0, common_1.Put)('admin/maps/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.UpdateMapConfigurationDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "updateMapConfiguration", null);
__decorate([
    (0, common_1.Delete)('admin/maps/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "deleteMapConfiguration", null);
__decorate([
    (0, common_1.Get)('admin/location-categories'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getAllLocationCategories", null);
__decorate([
    (0, common_1.Get)('admin/location-categories/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getLocationCategoryById", null);
__decorate([
    (0, common_1.Post)('admin/location-categories'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateLocationCategoryDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "createLocationCategory", null);
__decorate([
    (0, common_1.Put)('admin/location-categories/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.UpdateLocationCategoryDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "updateLocationCategory", null);
__decorate([
    (0, common_1.Delete)('admin/location-categories/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "deleteLocationCategory", null);
__decorate([
    (0, common_1.Get)('admin/location-assignments'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.LocationQueryDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getLocationAssignments", null);
__decorate([
    (0, common_1.Post)('admin/location-assignments'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateLocationAssignmentDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "createLocationAssignment", null);
__decorate([
    (0, common_1.Put)('admin/location-assignments/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.UpdateLocationAssignmentDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "updateLocationAssignment", null);
__decorate([
    (0, common_1.Delete)('admin/location-assignments/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "deleteLocationAssignment", null);
__decorate([
    (0, common_1.Put)('admin/offices/:id'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.UpdateOfficeDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "updateOffice", null);
__decorate([
    (0, common_1.Post)('admin/analytics/social'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [social_media_maps_dto_1.CreateSocialMediaAnalyticsDto, Number]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "recordSocialMediaAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/analytics/social'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getSocialMediaAnalytics", null);
__decorate([
    (0, common_1.Get)('admin/analytics/shares'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, social_media_maps_dto_1.ShareAnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getSocialMediaShares", null);
__decorate([
    (0, common_1.Get)('admin/platforms'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getSupportedPlatforms", null);
__decorate([
    (0, common_1.Get)('admin/map-providers'),
    (0, roles_decorator_1.Roles)('TENANT_ADMIN', 'EDITOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialMediaMapsController.prototype, "getSupportedMapProviders", null);
exports.SocialMediaMapsController = SocialMediaMapsController = __decorate([
    (0, common_1.Controller)('social-media-maps'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, tenant_guard_1.TenantGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __metadata("design:paramtypes", [social_media_maps_service_1.SocialMediaMapsService])
], SocialMediaMapsController);
//# sourceMappingURL=social-media-maps.controller.js.map