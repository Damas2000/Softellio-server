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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const client_1 = require("@prisma/client");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    create(createTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }
    findAll() {
        return this.tenantsService.findAll();
    }
    findOne(id) {
        return this.tenantsService.findOne(id);
    }
    update(id, updateTenantDto) {
        return this.tenantsService.update(id, updateTenantDto);
    }
    toggleActive(id) {
        return this.tenantsService.toggleActive(id);
    }
    remove(id) {
        return this.tenantsService.remove(id);
    }
    getFeatures(id) {
        return this.tenantsService.getFeatures(id);
    }
    updateFeature(id, module, body) {
        return this.tenantsService.updateFeature(id, module, body.enabled);
    }
    impersonate(id, user) {
        return this.tenantsService.generateImpersonationToken(id, user.id);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Tenant with domain already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenants' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle tenant active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/features'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant features' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant features' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getFeatures", null);
__decorate([
    (0, common_1.Patch)(':id/features/:module'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant feature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feature updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('module', new common_1.ParseEnumPipe(client_1.ModuleName))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateFeature", null);
__decorate([
    (0, common_1.Post)(':id/impersonate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate impersonation token for tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Impersonation token generated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "impersonate", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants (Super Admin)'),
    (0, common_1.Controller)('super-admin/tenants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map