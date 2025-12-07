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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactInfoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let ContactInfoService = class ContactInfoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createContactInfoDto, tenantId) {
        const existingContactInfo = await this.prisma.contactInfo.findUnique({
            where: { tenantId },
        });
        if (existingContactInfo) {
            throw new common_1.ConflictException('Contact info already exists for this tenant');
        }
        const contactInfo = await this.prisma.contactInfo.create({
            data: {
                tenantId,
                logo: createContactInfoDto.logo,
                favicon: createContactInfoDto.favicon,
                translations: {
                    create: createContactInfoDto.translations,
                },
                offices: createContactInfoDto.offices ? {
                    create: createContactInfoDto.offices,
                } : undefined,
                socialLinks: createContactInfoDto.socialLinks ? {
                    create: createContactInfoDto.socialLinks.map(link => ({
                        ...link,
                        tenantId,
                    })),
                } : undefined,
            },
            include: {
                translations: true,
                offices: {
                    orderBy: { order: 'asc' },
                },
                socialLinks: {
                    where: { contactInfoId: { not: null } },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return contactInfo;
    }
    async findByTenant(tenantId) {
        const contactInfo = await this.prisma.contactInfo.findUnique({
            where: { tenantId },
            include: {
                translations: true,
                offices: {
                    orderBy: { order: 'asc' },
                },
                socialLinks: {
                    where: { contactInfoId: { not: null } },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return contactInfo;
    }
    async findByTenantAndLanguage(tenantId, language) {
        const contactInfo = await this.findByTenant(tenantId);
        if (!contactInfo) {
            return null;
        }
        const translation = contactInfo.translations.find(t => t.language === language) || null;
        return {
            id: contactInfo.id,
            logo: contactInfo.logo,
            favicon: contactInfo.favicon,
            translation: translation ? {
                companyName: translation.companyName,
                tagline: translation.tagline,
                description: translation.description,
                workingHours: translation.workingHours,
            } : null,
            offices: contactInfo.offices.filter(office => office.isActive),
            socialLinks: contactInfo.socialLinks.filter(link => link.isActive),
        };
    }
    async update(tenantId, updateContactInfoDto) {
        const existingContactInfo = await this.findByTenant(tenantId);
        if (!existingContactInfo) {
            throw new common_1.NotFoundException('Contact info not found for this tenant');
        }
        await this.prisma.contactInfo.update({
            where: { tenantId },
            data: {
                logo: updateContactInfoDto.logo,
                favicon: updateContactInfoDto.favicon,
            },
        });
        if (updateContactInfoDto.translations) {
            await this.prisma.contactInfoTranslation.deleteMany({
                where: { contactInfoId: existingContactInfo.id },
            });
            await this.prisma.contactInfoTranslation.createMany({
                data: updateContactInfoDto.translations.map(translation => ({
                    contactInfoId: existingContactInfo.id,
                    ...translation,
                })),
            });
        }
        if (updateContactInfoDto.offices) {
            await this.prisma.office.deleteMany({
                where: { contactInfoId: existingContactInfo.id },
            });
            if (updateContactInfoDto.offices.length > 0) {
                await this.prisma.office.createMany({
                    data: updateContactInfoDto.offices.map(office => ({
                        contactInfoId: existingContactInfo.id,
                        ...office,
                    })),
                });
            }
        }
        if (updateContactInfoDto.socialLinks) {
            await this.prisma.socialMediaLink.deleteMany({
                where: { contactInfoId: existingContactInfo.id },
            });
            if (updateContactInfoDto.socialLinks.length > 0) {
                await this.prisma.socialMediaLink.createMany({
                    data: updateContactInfoDto.socialLinks.map(link => ({
                        contactInfoId: existingContactInfo.id,
                        tenantId,
                        ...link,
                    })),
                });
            }
        }
        return this.findByTenant(tenantId);
    }
    async delete(tenantId) {
        const contactInfo = await this.findByTenant(tenantId);
        if (!contactInfo) {
            throw new common_1.NotFoundException('Contact info not found for this tenant');
        }
        await this.prisma.contactInfo.delete({
            where: { tenantId },
        });
    }
    async createSubmission(contactSubmissionDto, tenantId, ipAddress, userAgent) {
        const submission = await this.prisma.contactSubmission.create({
            data: {
                tenantId,
                name: contactSubmissionDto.name,
                email: contactSubmissionDto.email,
                phone: contactSubmissionDto.phone,
                subject: contactSubmissionDto.subject,
                message: contactSubmissionDto.message,
                ipAddress,
                userAgent,
            },
        });
        return submission;
    }
    async findSubmissions(tenantId, query = {}) {
        const { page = 1, limit = 20, search, unreadOnly, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (unreadOnly) {
            whereClause.isRead = false;
        }
        if (search) {
            whereClause.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    subject: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [submissions, total, unreadCount] = await Promise.all([
            this.prisma.contactSubmission.findMany({
                where: whereClause,
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.contactSubmission.count({ where: whereClause }),
            this.prisma.contactSubmission.count({
                where: { tenantId, isRead: false }
            }),
        ]);
        return {
            submissions,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            unreadCount,
        };
    }
    async findSubmissionById(id, tenantId) {
        const submission = await this.prisma.contactSubmission.findFirst({
            where: { id, tenantId },
        });
        if (!submission) {
            throw new common_1.NotFoundException('Contact submission not found');
        }
        return submission;
    }
    async markSubmissionAsRead(id, tenantId) {
        await this.findSubmissionById(id, tenantId);
        return this.prisma.contactSubmission.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markSubmissionAsReplied(id, tenantId) {
        await this.findSubmissionById(id, tenantId);
        return this.prisma.contactSubmission.update({
            where: { id },
            data: { isReplied: true, isRead: true },
        });
    }
    async deleteSubmission(id, tenantId) {
        await this.findSubmissionById(id, tenantId);
        await this.prisma.contactSubmission.delete({
            where: { id },
        });
    }
    async bulkDeleteSubmissions(ids, tenantId) {
        let deleted = 0;
        let failed = 0;
        for (const id of ids) {
            try {
                await this.deleteSubmission(id, tenantId);
                deleted++;
            }
            catch (error) {
                console.error(`Failed to delete submission ${id}:`, error);
                failed++;
            }
        }
        return { deleted, failed };
    }
    async getSubmissionStats(tenantId) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const [total, unread, replied, thisMonth] = await Promise.all([
            this.prisma.contactSubmission.count({ where: { tenantId } }),
            this.prisma.contactSubmission.count({ where: { tenantId, isRead: false } }),
            this.prisma.contactSubmission.count({ where: { tenantId, isReplied: true } }),
            this.prisma.contactSubmission.count({
                where: {
                    tenantId,
                    createdAt: { gte: startOfMonth }
                }
            }),
        ]);
        return {
            total,
            unread,
            replied,
            thisMonth,
        };
    }
};
exports.ContactInfoService = ContactInfoService;
exports.ContactInfoService = ContactInfoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactInfoService);
//# sourceMappingURL=contact-info.service.js.map