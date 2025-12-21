import { Request } from 'express';
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto, UpdateContactInfoDto, ContactSubmissionDto, ContactSubmissionQueryDto } from './dto/contact-info.dto';
export declare class ContactInfoController {
    private readonly contactInfoService;
    constructor(contactInfoService: ContactInfoService);
    create(createContactInfoDto: CreateContactInfoDto, tenantId: number): Promise<import("./contact-info.service").ContactInfoWithRelations>;
    findAll(tenantId: number): Promise<import("./contact-info.service").ContactInfoWithRelations>;
    findByLanguage(language: string, tenantId: number): Promise<{
        id: number;
        logo: string | null;
        favicon: string | null;
        translation: {
            companyName: string;
            tagline: string | null;
            description: string | null;
            workingHours: string | null;
        } | null;
        offices: any[];
        socialLinks: any[];
    }>;
    update(updateContactInfoDto: UpdateContactInfoDto, tenantId: number): Promise<import("./contact-info.service").ContactInfoWithRelations>;
    remove(tenantId: number): Promise<void>;
    findSubmissions(tenantId: number, query: ContactSubmissionQueryDto): Promise<{
        submissions: import(".prisma/client").ContactSubmission[];
        total: number;
        totalPages: number;
        currentPage: number;
        unreadCount: number;
    }>;
    getSubmissionStats(tenantId: number): Promise<{
        total: number;
        unread: number;
        replied: number;
        thisMonth: number;
    }>;
    findSubmission(id: number, tenantId: number): Promise<{
        email: string;
        id: number;
        name: string;
        tenantId: number;
        createdAt: Date;
        message: string;
        phone: string | null;
        subject: string | null;
        isRead: boolean;
        isReplied: boolean;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    markAsRead(id: number, tenantId: number): Promise<{
        email: string;
        id: number;
        name: string;
        tenantId: number;
        createdAt: Date;
        message: string;
        phone: string | null;
        subject: string | null;
        isRead: boolean;
        isReplied: boolean;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    markAsReplied(id: number, tenantId: number): Promise<{
        email: string;
        id: number;
        name: string;
        tenantId: number;
        createdAt: Date;
        message: string;
        phone: string | null;
        subject: string | null;
        isRead: boolean;
        isReplied: boolean;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    deleteSubmission(id: number, tenantId: number): Promise<void>;
    bulkDeleteSubmissions(body: {
        ids: number[];
    }, tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    getPublicContactInfo(tenantId: number, language?: string): Promise<{
        companyName: string;
        tagline: string;
        description: string;
        workingHours: string;
        offices: any[];
        socialLinks: any[];
        logo: string;
        favicon: string;
    }>;
    getPublicOffices(tenantId: number): Promise<{
        offices: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
            fax: string | null;
            address: string | null;
            mapUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            isPrimary: boolean;
            isActive: boolean;
            order: number | null;
        }[];
    }>;
    getPublicSocialLinks(tenantId: number): Promise<{
        socialLinks: {
            id: number;
            platform: string;
            url: string;
            icon: string | null;
            isActive: boolean;
            order: number | null;
        }[];
    }>;
    submitContact(contactSubmissionDto: ContactSubmissionDto, tenantId: number, request: Request): Promise<{
        message: string;
        submissionId: number;
        submittedAt: Date;
    }>;
    getVCard(tenantId: number, language?: string, officeId?: number): Promise<{
        vcard: {
            companyName: string;
            phone: any;
            email: any;
            address: any;
            website: string;
            socialLinks: any[];
        };
    }>;
}
