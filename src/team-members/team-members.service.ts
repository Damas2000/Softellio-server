import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto, TeamMemberQueryDto } from './dto/team-member.dto';
import { TeamMember } from '@prisma/client';

export interface TeamMemberWithRelations extends TeamMember {
  translations: {
    id: number;
    language: string;
    name: string;
    position: string;
    bio: string | null;
    expertise: string | null;
  }[];
  socialLinks: {
    id: number;
    platform: string;
    url: string;
    icon: string | null;
    isActive: boolean;
    order: number | null;
  }[];
}

@Injectable()
export class TeamMembersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTeamMemberDto: CreateTeamMemberDto,
    tenantId: number,
  ): Promise<TeamMemberWithRelations> {
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
            tenantId, // Required for SocialMediaLink
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
    }) as TeamMemberWithRelations;

    return teamMember;
  }

  async findAll(
    tenantId: number,
    query: TeamMemberQueryDto = {},
  ): Promise<{
    teamMembers: TeamMemberWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

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

    let orderBy: any = {};
    if (sortBy === 'name') {
      // For sorting by name, we need to sort by first translation
      orderBy = {
        translations: {
          _count: sortOrder,
        },
      };
    } else {
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
      teamMembers: teamMembers as TeamMemberWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: number, tenantId: number): Promise<TeamMemberWithRelations> {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { id, tenantId },
      include: {
        translations: true,
        socialLinks: {
          where: { teamMemberId: { not: null } },
          orderBy: { order: 'asc' },
        },
      },
    }) as TeamMemberWithRelations | null;

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    return teamMember;
  }

  async findPublicTeamMembers(
    tenantId: number,
    language: string,
    query: TeamMemberQueryDto = {},
  ): Promise<{
    teamMembers: {
      id: number;
      email: string | null;
      phone: string | null;
      imageUrl: string | null;
      order: number | null;
      translation: {
        name: string;
        position: string;
        bio: string | null;
        expertise: string | null;
      } | null;
      socialLinks: {
        platform: string;
        url: string;
        icon: string | null;
        order: number | null;
      }[];
    }[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = {
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
    })).filter(member => member.translation); // Only include members with translation in the requested language

    return {
      teamMembers: formattedTeamMembers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async update(
    id: number,
    updateTeamMemberDto: UpdateTeamMemberDto,
    tenantId: number,
  ): Promise<TeamMemberWithRelations> {
    // Check if team member exists
    await this.findOne(id, tenantId);

    // Update team member basic info
    const updateData: any = {};
    if (updateTeamMemberDto.email !== undefined) updateData.email = updateTeamMemberDto.email;
    if (updateTeamMemberDto.phone !== undefined) updateData.phone = updateTeamMemberDto.phone;
    if (updateTeamMemberDto.imageUrl !== undefined) updateData.imageUrl = updateTeamMemberDto.imageUrl;
    if (updateTeamMemberDto.order !== undefined) updateData.order = updateTeamMemberDto.order;
    if (updateTeamMemberDto.isActive !== undefined) updateData.isActive = updateTeamMemberDto.isActive;

    await this.prisma.teamMember.update({
      where: { id },
      data: updateData,
    });

    // Update translations if provided
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

    // Update social links if provided
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

    // Return updated team member
    return this.findOne(id, tenantId);
  }

  async remove(id: number, tenantId: number): Promise<void> {
    // Check if team member exists
    await this.findOne(id, tenantId);

    await this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async bulkDelete(ids: number[], tenantId: number): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.remove(id, tenantId);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete team member ${id}:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }

  async reorder(
    memberUpdates: { id: number; order: number }[],
    tenantId: number,
  ): Promise<void> {
    // Verify all team members belong to the tenant
    for (const update of memberUpdates) {
      await this.findOne(update.id, tenantId);
    }

    // Update orders
    for (const update of memberUpdates) {
      await this.prisma.teamMember.update({
        where: { id: update.id },
        data: { order: update.order },
      });
    }
  }

  async getStats(tenantId: number): Promise<{
    total: number;
    active: number;
    byLanguage: Record<string, number>;
  }> {
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
    }, {} as Record<string, number>);

    return {
      total,
      active,
      byLanguage,
    };
  }
}