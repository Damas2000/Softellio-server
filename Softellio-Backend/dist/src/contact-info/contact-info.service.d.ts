import { PrismaService } from '../config/prisma.service';
import { CreateContactInfoDto, UpdateContactInfoDto, ContactSubmissionDto, ContactSubmissionQueryDto } from './dto/contact-info.dto';
import { ContactInfo, ContactSubmission } from '@prisma/client';
export interface ContactInfoWithRelations extends ContactInfo {
    translations: {
        id: number;
        language: string;
        companyName: string;
        tagline: string | null;
        description: string | null;
        workingHours: string | null;
    }[];
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
    socialLinks: {
        id: number;
        platform: string;
        url: string;
        icon: string | null;
        isActive: boolean;
        order: number | null;
    }[];
}
export declare class ContactInfoService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createContactInfoDto: CreateContactInfoDto, tenantId: number): Promise<ContactInfoWithRelations>;
    findByTenant(tenantId: number): Promise<ContactInfoWithRelations | null>;
    findByTenantAndLanguage(tenantId: number, language: string): Promise<{
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
    } | null>;
    update(tenantId: number, updateContactInfoDto: UpdateContactInfoDto): Promise<ContactInfoWithRelations>;
    delete(tenantId: number): Promise<void>;
    createSubmission(contactSubmissionDto: ContactSubmissionDto, tenantId: number, ipAddress?: string, userAgent?: string): Promise<ContactSubmission>;
    findSubmissions(tenantId: number, query?: ContactSubmissionQueryDto): Promise<{
        submissions: ContactSubmission[];
        total: number;
        totalPages: number;
        currentPage: number;
        unreadCount: number;
    }>;
    findSubmissionById(id: number, tenantId: number): Promise<ContactSubmission>;
    markSubmissionAsRead(id: number, tenantId: number): Promise<ContactSubmission>;
    markSubmissionAsReplied(id: number, tenantId: number): Promise<ContactSubmission>;
    deleteSubmission(id: number, tenantId: number): Promise<void>;
    bulkDeleteSubmissions(ids: number[], tenantId: number): Promise<{
        deleted: number;
        failed: number;
    }>;
    getSubmissionStats(tenantId: number): Promise<{
        total: number;
        unread: number;
        replied: number;
        thisMonth: number;
    }>;
}
