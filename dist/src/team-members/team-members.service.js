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
exports.TeamMembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let TeamMembersService = class TeamMembersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTeamMemberDto, tenantId) {
        const teamMember = await this.prisma.teamMember.create({
            data: {
                tenantId,
                email: createTeamMemberDto.email,
                phone: createTeamMemberDto.phone,
                imageUrl: createTeamMemberDto.imageUrl,
                order: createTeamMemberDto.order,
                isActive: createTeamMemberDto.isActive,
                translations: {
                    create: createTeamMemberDto.translations,
                },
                socialLinks: createTeamMemberDto.socialLinks ? {
                    create: createTeamMemberDto.socialLinks.map(link => ({
                        ...link,
                        tenantId,
                    })),
                } : undefined,
            },
            include: {
                translations: true,
                socialLinks: {
                    where: { teamMemberId: { not: null } },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return teamMember;
    }
    async findAll(tenantId, query = {}) {
        const { page = 1, limit = 20, search, sortBy = 'order', sortOrder = 'asc', } = query;
        const offset = (page - 1) * limit;
        const whereClause = { tenantId };
        if (search) {
            whereClause.translations = {
                some: {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            position: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            };
        }
        let orderBy = {};
        if (sortBy === 'name') {
            orderBy = {
                translations: {
                    _count: sortOrder,
                },
            };
        }
        else {
            orderBy[sortBy] = sortOrder;
        }
        const [teamMembers, total] = await Promise.all([
            this.prisma.teamMember.findMany({
                where: whereClause,
                include: {
                    translations: true,
                    socialLinks: {
                        where: { teamMemberId: { not: null } },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy,
                skip: offset,
                take: limit,
            }),
            this.prisma.teamMember.count({ where: whereClause }),
        ]);
        return {
            teamMembers: teamMembers,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async findOne(id, tenantId) {
        const teamMember = await this.prisma.teamMember.findFirst({
            where: { id, tenantId },
            include: {
                translations: true,
                socialLinks: {
                    where: { teamMemberId: { not: null } },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!teamMember) {
            throw new common_1.NotFoundException('Team member not found');
        }
        return teamMember;
    }
    async findPublicTeamMembers(tenantId, language, query = {}) {
        const { page = 1, limit = 20, search, } = query;
        const offset = (page - 1) * limit;
        const whereClause = {
            tenantId,
            isActive: true,
        };
        if (search) {
            whereClause.translations = {
                some: {
                    AND: [
                        { language },
                        {
                            OR: [
                                {
                                    name: {
                                        contains: search,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    position: {
                                        contains: search,
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        }
        const [teamMembers, total] = await Promise.all([
            this.prisma.teamMember.findMany({
                where: whereClause,
                include: {
                    translations: {
                        where: { language },
                        take: 1,
                    },
                    socialLinks: {
                        where: {
                            teamMemberId: { not: null },
                            isActive: true,
                        },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
                skip: offset,
                take: limit,
            }),
            this.prisma.teamMember.count({ where: whereClause }),
        ]);
        const formattedTeamMembers = teamMembers.map(member => ({
            id: member.id,
            email: member.email,
            phone: member.phone,
            imageUrl: member.imageUrl,
            order: member.order,
            translation: member.translations[0] ? {
                name: member.translations[0].name,
                position: member.translations[0].position,
                bio: member.translations[0].bio,
                expertise: member.translations[0].expertise,
            } : null,
            socialLinks: member.socialLinks.map(link => ({
                platform: link.platform,
                url: link.url,
                icon: link.icon,
                order: link.order,
            })),
        })).filter(member => member.translation);
        return {
            teamMembers: formattedTeamMembers,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async update(id, updateTeamMemberDto, tenantId) {
        await this.findOne(id, tenantId);
        const updateData = {};
        if (updateTeamMemberDto.email !== undefined)
            updateData.email = updateTeamMemberDto.email;
        if (updateTeamMemberDto.phone !== undefined)
            updateData.phone = updateTeamMemberDto.phone;
        if (updateTeamMemberDto.imageUrl !== undefined)
            updateData.imageUrl = updateTeamMemberDto.imageUrl;
        if (updateTeamMemberDto.order !== undefined)
            updateData.order = updateTeamMemberDto.order;
        if (updateTeamMemberDto.isActive !== undefined)
            updateData.isActive = updateTeamMemberDto.isActive;
        await this.prisma.teamMember.update({
            where: { id },
            data: updateData,
        });
        if (updateTeamMemberDto.translations) {
            await this.prisma.teamMemberTranslation.deleteMany({
                where: { teamId: id },
            });
            await this.prisma.teamMemberTranslation.createMany({
                data: updateTeamMemberDto.translations.map(translation => ({
                    teamId: id,
                    ...translation,
                })),
            });
        }
        if (updateTeamMemberDto.socialLinks) {
            await this.prisma.socialMediaLink.deleteMany({
                where: { teamMemberId: id },
            });
            if (updateTeamMemberDto.socialLinks.length > 0) {
                await this.prisma.socialMediaLink.createMany({
                    data: updateTeamMemberDto.socialLinks.map(link => ({
                        teamMemberId: id,
                        tenantId,
                        ...link,
                    })),
                });
            }
        }
        return this.findOne(id, tenantId);
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.teamMember.delete({
            where: { id },
        });
    }
    async bulkDelete(ids, tenantId) {
        let deleted = 0;
        let failed = 0;
        for (const id of ids) {
            try {
                await this.remove(id, tenantId);
                deleted++;
            }
            catch (error) {
                console.error(`Failed to delete team member ${id}:`, error);
                failed++;
            }
        }
        return { deleted, failed };
    }
    async reorder(memberUpdates, tenantId) {
        for (const update of memberUpdates) {
            await this.findOne(update.id, tenantId);
        }
        for (const update of memberUpdates) {
            await this.prisma.teamMember.update({
                where: { id: update.id },
                data: { order: update.order },
            });
        }
    }
    async getStats(tenantId) {
        const [total, active, translationStats] = await Promise.all([
            this.prisma.teamMember.count({ where: { tenantId } }),
            this.prisma.teamMember.count({ where: { tenantId, isActive: true } }),
            this.prisma.teamMemberTranslation.groupBy({
                by: ['language'],
                where: {
                    teamMember: { tenantId },
                },
                _count: true,
            }),
        ]);
        const byLanguage = translationStats.reduce((acc, item) => {
            acc[item.language] = item._count;
            return acc;
        }, {});
        return {
            total,
            active,
            byLanguage,
        };
    }
};
exports.TeamMembersService = TeamMembersService;
exports.TeamMembersService = TeamMembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamMembersService);
//# sourceMappingURL=team-members.service.js.map