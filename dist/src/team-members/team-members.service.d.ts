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
export declare class TeamMembersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTeamMemberDto: CreateTeamMemberDto, tenantId: number): Promise<TeamMemberWithRelations>;
    findAll(tenantId: number, query?: TeamMemberQueryDto): Promise<{
        teamMembers: TeamMemberWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    findOne(id: number, tenantId: number): Promise<TeamMemberWithRelations>;
    findPublicTeamMembers(tenantId: number, language: string, query?: TeamMemberQueryDto): Promise<{
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
    }>;
    update(id: number, updateTeamMemberDto: UpdateTeamMemberDto, tenantId: number): Promise<TeamMemberWithRelations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(ids: number[], tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    reorder(memberUpdates: {
        id: number;
        order: number;
    }[], tenantId: number): Promise<void>;
    getStats(tenantId: number): Promise<{
        total: number;
        active: number;
        byLanguage: Record<string, number>;
    }>;
}
