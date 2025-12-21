export declare class ContactInfoTranslationDto {
    language: string;
    companyName: string;
    tagline?: string;
    description?: string;
    workingHours?: string;
}
export declare class OfficeDto {
    name: string;
    email?: string;
    phone?: string;
    fax?: string;
    address?: string;
    mapUrl?: string;
    latitude?: number;
    longitude?: number;
    isPrimary?: boolean;
    isActive?: boolean;
    order?: number;
}
export declare class SocialMediaLinkDto {
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
}
export declare class CreateContactInfoDto {
    logo?: string;
    favicon?: string;
    translations: ContactInfoTranslationDto[];
    offices?: OfficeDto[];
    socialLinks?: SocialMediaLinkDto[];
}
export declare class UpdateContactInfoDto {
    logo?: string;
    favicon?: string;
    translations?: ContactInfoTranslationDto[];
    offices?: OfficeDto[];
    socialLinks?: SocialMediaLinkDto[];
}
export declare class ContactSubmissionDto {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
}
export declare class ContactSubmissionQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    unreadOnly?: boolean;
    sortBy?: 'createdAt' | 'name' | 'email';
    sortOrder?: 'asc' | 'desc';
}
