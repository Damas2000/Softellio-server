export declare class TeamMemberTranslationDto {
    language: string;
    name: string;
    position: string;
    bio?: string;
    expertise?: string;
}
export declare class TeamMemberSocialLinkDto {
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
}
export declare class CreateTeamMemberDto {
    email?: string;
    phone?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
    translations: TeamMemberTranslationDto[];
    socialLinks?: TeamMemberSocialLinkDto[];
}
export declare class UpdateTeamMemberDto {
    email?: string;
    phone?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
    translations?: TeamMemberTranslationDto[];
    socialLinks?: TeamMemberSocialLinkDto[];
}
export declare class TeamMemberQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'name';
    sortOrder?: 'asc' | 'desc';
}
export declare class BulkTeamMemberDeleteDto {
    ids: number[];
}
export declare class TeamMemberReorderDto {
    teamMembers: TeamMemberOrderDto[];
}
export declare class TeamMemberOrderDto {
    id: number;
    order: number;
}
