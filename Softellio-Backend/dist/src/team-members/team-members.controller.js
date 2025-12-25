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
exports.TeamMembersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const team_members_service_1 = require("./team-members.service");
const team_member_dto_1 = require("./dto/team-member.dto");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let TeamMembersController = class TeamMembersController {
    constructor(teamMembersService) {
        this.teamMembersService = teamMembersService;
    }
    create(createTeamMemberDto, tenantId) {
        return this.teamMembersService.create(createTeamMemberDto, tenantId);
    }
    findAll(tenantId, query) {
        return this.teamMembersService.findAll(tenantId, query);
    }
    getStats(tenantId) {
        return this.teamMembersService.getStats(tenantId);
    }
    findOne(id, tenantId) {
        return this.teamMembersService.findOne(id, tenantId);
    }
    update(id, updateTeamMemberDto, tenantId) {
        return this.teamMembersService.update(id, updateTeamMemberDto, tenantId);
    }
    remove(id, tenantId) {
        return this.teamMembersService.remove(id, tenantId);
    }
    bulkDelete(bulkDeleteDto, tenantId) {
        return this.teamMembersService.bulkDelete(bulkDeleteDto.ids, tenantId);
    }
    bulkDeleteDeprecated(body) {
        throw new common_1.GoneException('This endpoint is deprecated. Use POST /team-members/admin/bulk-delete');
    }
    reorder(reorderDto, tenantId) {
        return this.teamMembersService.reorder(reorderDto.teamMembers, tenantId);
    }
    findPublic(language, tenantId, query) {
        return this.teamMembersService.findPublicTeamMembers(tenantId, language, query);
    }
    async getLeadership(language, tenantId) {
        const result = await this.teamMembersService.findPublicTeamMembers(tenantId, language, { limit: 3, sortBy: 'order', sortOrder: 'asc' });
        return { leadership: result.teamMembers };
    }
    async getVCard(language, id, tenantId) {
        const teamMember = await this.teamMembersService.findOne(id, tenantId);
        if (!teamMember.isActive) {
            return { vcard: null };
        }
        const translation = teamMember.translations.find(t => t.language === language);
        if (!translation) {
            return { vcard: null };
        }
        const vCardData = {
            name: translation.name,
            position: translation.position,
            phone: teamMember.phone,
            email: teamMember.email,
            bio: translation.bio,
            expertise: translation.expertise,
            photoUrl: teamMember.imageUrl,
            socialLinks: teamMember.socialLinks.filter(link => link.isActive),
        };
        return { vcard: vCardData };
    }
    async getDirectory(language, tenantId) {
        const result = await this.teamMembersService.findPublicTeamMembers(tenantId, language, { limit: 1000 });
        const directory = result.teamMembers.map(member => ({
            id: member.id,
            name: member.translation?.name || 'Unknown',
            position: member.translation?.position || 'Position not available',
            email: member.email,
            phone: member.phone,
            imageUrl: member.imageUrl,
            socialLinks: member.socialLinks,
        }));
        return { directory };
    }
    async getByExpertise(language, expertise, tenantId) {
        const allMembers = await this.teamMembersService.findPublicTeamMembers(tenantId, language, { limit: 1000 });
        const expertMembers = allMembers.teamMembers.filter(member => member.translation?.expertise?.toLowerCase().includes(expertise.toLowerCase()));
        return { teamMembers: expertMembers, expertise };
    }
};
exports.TeamMembersController = TeamMembersController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create new team member (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Team member created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [team_member_dto_1.CreateTeamMemberDto, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all team members with filtering (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'name'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team members retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, team_member_dto_1.TeamMemberQueryDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get team members statistics (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team members statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get team member by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team member retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team member not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update team member (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team member updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team member not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, team_member_dto_1.UpdateTeamMemberDto, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete team member (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team member deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team member not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('admin/bulk-delete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete team members (Admin)' }),
    (0, swagger_1.ApiBody)({ type: bulk_delete_dto_1.BulkDeleteDto, description: 'Array of team member IDs to delete' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: bulk_delete_dto_1.BulkDeleteResponseDto, description: 'Team members deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "bulkDeleteDeprecated", null);
__decorate([
    (0, common_1.Patch)('admin/reorder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder team members (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team members reordered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [team_member_dto_1.TeamMemberReorderDto, Number]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)('public/:language'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public team members for specific language' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public team members retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, team_member_dto_1.TeamMemberQueryDto]),
    __metadata("design:returntype", void 0)
], TeamMembersController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Get)('public/:language/leadership'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get leadership team (top 3 by order)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leadership team retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TeamMembersController.prototype, "getLeadership", null);
__decorate([
    (0, common_1.Get)('public/:language/:id/vcard'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get vCard data for team member' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'vCard data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team member not found' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], TeamMembersController.prototype, "getVCard", null);
__decorate([
    (0, common_1.Get)('public/:language/directory'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get team directory with contact info' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team directory retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TeamMembersController.prototype, "getDirectory", null);
__decorate([
    (0, common_1.Get)('public/:language/expertise/:expertise'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get team members by expertise area' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team members by expertise retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, common_1.Param)('expertise')),
    __param(2, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], TeamMembersController.prototype, "getByExpertise", null);
exports.TeamMembersController = TeamMembersController = __decorate([
    (0, swagger_1.ApiTags)('Team Members'),
    (0, common_1.Controller)('team-members'),
    __metadata("design:paramtypes", [team_members_service_1.TeamMembersService])
], TeamMembersController);
//# sourceMappingURL=team-members.controller.js.map