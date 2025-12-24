import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto, TeamMemberQueryDto, BulkTeamMemberDeleteDto, TeamMemberReorderDto } from './dto/team-member.dto';
export declare class TeamMembersController {
    private readonly teamMembersService;
    constructor(teamMembersService: TeamMembersService);
    create(createTeamMemberDto: CreateTeamMemberDto, tenantId: number): Promise<import("./team-members.service").TeamMemberWithRelations>;
    findAll(tenantId: number, query: TeamMemberQueryDto): Promise<{
        teamMembers: import("./team-members.service").TeamMemberWithRelations[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getStats(tenantId: number): Promise<{
        total: number;
        active: number;
        byLanguage: Record<string, number>;
    }>;
    findOne(id: number, tenantId: number): Promise<import("./team-members.service").TeamMemberWithRelations>;
    update(id: number, updateTeamMemberDto: UpdateTeamMemberDto, tenantId: number): Promise<import("./team-members.service").TeamMemberWithRelations>;
    remove(id: number, tenantId: number): Promise<void>;
    bulkDelete(bulkDeleteDto: BulkTeamMemberDeleteDto, tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    reorder(reorderDto: TeamMemberReorderDto, tenantId: number): Promise<void>;
    findPublic(language: string, tenantId: number, query: TeamMemberQueryDto): Promise<{
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
    getLeadership(language: string, tenantId: number): Promise<{
        leadership: {
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
    }>;
    getVCard(language: string, id: number, tenantId: number): Promise<{
        vcard: {
            name: string;
            position: string;
            phone: string;
            email: string;
            bio: string;
            expertise: string;
            photoUrl: string;
            socialLinks: {
                id: number;
                platform: string;
                url: string;
                icon: string | null;
                isActive: boolean;
                order: number | null;
            }[];
        };
    }>;
    getDirectory(language: string, tenantId: number): Promise<{
        directory: {
            id: number;
            name: string;
            position: string;
            email: string;
            phone: string;
            imageUrl: string;
            socialLinks: {
                platform: string;
                url: string;
                icon: string | null;
                order: number | null;
            }[];
        }[];
    }>;
    getByExpertise(language: string, expertise: string, tenantId: number): Promise<{
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
        expertise: string;
    }>;
}
