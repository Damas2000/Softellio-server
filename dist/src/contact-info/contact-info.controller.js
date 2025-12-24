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
exports.ContactInfoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contact_info_service_1 = require("./contact-info.service");
const contact_info_dto_1 = require("./dto/contact-info.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_tenant_decorator_1 = require("../common/decorators/current-tenant.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let ContactInfoController = class ContactInfoController {
    constructor(contactInfoService) {
        this.contactInfoService = contactInfoService;
    }
    create(createContactInfoDto, tenantId) {
        return this.contactInfoService.create(createContactInfoDto, tenantId);
    }
    findAll(tenantId) {
        return this.contactInfoService.findByTenant(tenantId);
    }
    findByLanguage(language, tenantId) {
        return this.contactInfoService.findByTenantAndLanguage(tenantId, language);
    }
    update(updateContactInfoDto, tenantId) {
        return this.contactInfoService.update(tenantId, updateContactInfoDto);
    }
    remove(tenantId) {
        return this.contactInfoService.delete(tenantId);
    }
    findSubmissions(tenantId, query) {
        return this.contactInfoService.findSubmissions(tenantId, query);
    }
    getSubmissionStats(tenantId) {
        return this.contactInfoService.getSubmissionStats(tenantId);
    }
    findSubmission(id, tenantId) {
        return this.contactInfoService.findSubmissionById(id, tenantId);
    }
    markAsRead(id, tenantId) {
        return this.contactInfoService.markSubmissionAsRead(id, tenantId);
    }
    markAsReplied(id, tenantId) {
        return this.contactInfoService.markSubmissionAsReplied(id, tenantId);
    }
    deleteSubmission(id, tenantId) {
        return this.contactInfoService.deleteSubmission(id, tenantId);
    }
    bulkDeleteSubmissions(body, tenantId) {
        return this.contactInfoService.bulkDeleteSubmissions(body.ids, tenantId);
    }
    async getPublicContactInfo(tenantId, language) {
        const lang = language || 'tr';
        const contactInfo = await this.contactInfoService.findByTenantAndLanguage(tenantId, lang);
        if (!contactInfo || !contactInfo.translation) {
            return {
                companyName: 'Company Name',
                tagline: null,
                description: null,
                workingHours: null,
                offices: [],
                socialLinks: [],
                logo: null,
                favicon: null,
            };
        }
        return {
            companyName: contactInfo.translation.companyName,
            tagline: contactInfo.translation.tagline,
            description: contactInfo.translation.description,
            workingHours: contactInfo.translation.workingHours,
            offices: contactInfo.offices,
            socialLinks: contactInfo.socialLinks,
            logo: contactInfo.logo,
            favicon: contactInfo.favicon,
        };
    }
    async getPublicOffices(tenantId) {
        const contactInfo = await this.contactInfoService.findByTenant(tenantId);
        if (!contactInfo) {
            return { offices: [] };
        }
        const activeOffices = contactInfo.offices
            .filter(office => office.isActive)
            .sort((a, b) => {
            if (a.isPrimary && !b.isPrimary)
                return -1;
            if (!a.isPrimary && b.isPrimary)
                return 1;
            return (a.order || 0) - (b.order || 0);
        });
        return { offices: activeOffices };
    }
    async getPublicSocialLinks(tenantId) {
        const contactInfo = await this.contactInfoService.findByTenant(tenantId);
        if (!contactInfo) {
            return { socialLinks: [] };
        }
        const activeSocialLinks = contactInfo.socialLinks
            .filter(link => link.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return { socialLinks: activeSocialLinks };
    }
    async submitContact(contactSubmissionDto, tenantId, request) {
        const ipAddress = request.ip || request.connection.remoteAddress;
        const userAgent = request.get('User-Agent');
        const submission = await this.contactInfoService.createSubmission(contactSubmissionDto, tenantId, ipAddress, userAgent);
        return {
            message: 'Contact form submitted successfully',
            submissionId: submission.id,
            submittedAt: submission.createdAt,
        };
    }
    async getVCard(tenantId, language, officeId) {
        const lang = language || 'tr';
        const contactInfo = await this.contactInfoService.findByTenantAndLanguage(tenantId, lang);
        if (!contactInfo) {
            return { vcard: null };
        }
        let selectedOffice;
        if (officeId) {
            selectedOffice = contactInfo.offices.find(office => office.id === officeId);
        }
        else {
            selectedOffice = contactInfo.offices.find(office => office.isPrimary) || contactInfo.offices[0];
        }
        const vCardData = {
            companyName: contactInfo.translation?.companyName || 'Company',
            phone: selectedOffice?.phone || '',
            email: selectedOffice?.email || '',
            address: selectedOffice?.address || '',
            website: '',
            socialLinks: contactInfo.socialLinks,
        };
        return { vcard: vCardData };
    }
};
exports.ContactInfoController = ContactInfoController;
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create contact information (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contact info created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Contact info already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_info_dto_1.CreateContactInfoDto, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact information with all data (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact info retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/:language'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact info for specific language (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact info for language retrieved successfully' }),
    __param(0, (0, common_1.Param)('language')),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "findByLanguage", null);
__decorate([
    (0, common_1.Patch)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update contact information (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact info updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact info not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_info_dto_1.UpdateContactInfoDto, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete contact information (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact info deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contact info not found' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('admin/submissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact form submissions (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', type: String, required: false, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'unreadOnly', type: Boolean, required: false, description: 'Show only unread submissions' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['createdAt', 'name', 'email'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact submissions retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, contact_info_dto_1.ContactSubmissionQueryDto]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "findSubmissions", null);
__decorate([
    (0, common_1.Get)('admin/submissions/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact submissions statistics (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submissions statistics retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "getSubmissionStats", null);
__decorate([
    (0, common_1.Get)('admin/submissions/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get contact submission by ID (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contact submission retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Submission not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "findSubmission", null);
__decorate([
    (0, common_1.Patch)('admin/submissions/:id/read'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Mark submission as read (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission marked as read successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Submission not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('admin/submissions/:id/replied'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Mark submission as replied (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission marked as replied successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Submission not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "markAsReplied", null);
__decorate([
    (0, common_1.Delete)('admin/submissions/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete contact submission (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Submission deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Submission not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "deleteSubmission", null);
__decorate([
    (0, common_1.Post)('admin/submissions/bulk-delete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TENANT_ADMIN, client_1.Role.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete contact submissions (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk delete completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], ContactInfoController.prototype, "bulkDeleteSubmissions", null);
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public contact information for default language' }),
    (0, swagger_1.ApiQuery)({
        name: 'lang',
        required: false,
        description: 'Language code (defaults to tenant default language)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public contact info retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ContactInfoController.prototype, "getPublicContactInfo", null);
__decorate([
    (0, common_1.Get)('public/offices'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active offices' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active offices retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactInfoController.prototype, "getPublicOffices", null);
__decorate([
    (0, common_1.Get)('public/social-links'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active social media links' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Social links retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactInfoController.prototype, "getPublicSocialLinks", null);
__decorate([
    (0, common_1.Post)('public/contact'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit contact form (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contact form submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_info_dto_1.ContactSubmissionDto, Number, Object]),
    __metadata("design:returntype", Promise)
], ContactInfoController.prototype, "submitContact", null);
__decorate([
    (0, common_1.Get)('public/vcard'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get vCard data for business card' }),
    (0, swagger_1.ApiQuery)({
        name: 'lang',
        required: false,
        description: 'Language code for company name'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'office',
        type: Number,
        required: false,
        description: 'Specific office ID (defaults to primary office)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'vCard data retrieved successfully' }),
    __param(0, (0, current_tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('lang')),
    __param(2, (0, common_1.Query)('office')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number]),
    __metadata("design:returntype", Promise)
], ContactInfoController.prototype, "getVCard", null);
exports.ContactInfoController = ContactInfoController = __decorate([
    (0, swagger_1.ApiTags)('Contact Info'),
    (0, common_1.Controller)('contact-info'),
    __metadata("design:paramtypes", [contact_info_service_1.ContactInfoService])
], ContactInfoController);
//# sourceMappingURL=contact-info.controller.js.map