import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import {
  CreateContactInfoDto,
  UpdateContactInfoDto,
  ContactSubmissionDto,
  ContactSubmissionQueryDto
} from './dto/contact-info.dto';
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

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  // ==================== CONTACT INFO MANAGEMENT ====================

  async create(
    createContactInfoDto: CreateContactInfoDto,
    tenantId: number,
  ): Promise<ContactInfoWithRelations> {
    // Check if contact info already exists for this tenant
    const existingContactInfo = await this.prisma.contactInfo.findUnique({
      where: { tenantId },
    });

    if (existingContactInfo) {
      throw new ConflictException('Contact info already exists for this tenant');
    }

    // Create contact info with all relations
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
            tenantId, // Required for SocialMediaLink
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
    }) as ContactInfoWithRelations;

    return contactInfo;
  }

  async findByTenant(tenantId: number): Promise<ContactInfoWithRelations | null> {
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
    }) as ContactInfoWithRelations | null;

    return contactInfo;
  }

  async findByTenantAndLanguage(
    tenantId: number,
    language: string,
  ): Promise<{
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
  } | null> {
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

  async update(
    tenantId: number,
    updateContactInfoDto: UpdateContactInfoDto,
  ): Promise<ContactInfoWithRelations> {
    // Check if contact info exists
    const existingContactInfo = await this.findByTenant(tenantId);
    if (!existingContactInfo) {
      throw new NotFoundException('Contact info not found for this tenant');
    }

    // Update basic info
    await this.prisma.contactInfo.update({
      where: { tenantId },
      data: {
        logo: updateContactInfoDto.logo,
        favicon: updateContactInfoDto.favicon,
      },
    });

    // Update translations if provided
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

    // Update offices if provided
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

    // Update social links if provided
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

    // Return updated contact info
    return this.findByTenant(tenantId) as Promise<ContactInfoWithRelations>;
  }

  async delete(tenantId: number): Promise<void> {
    const contactInfo = await this.findByTenant(tenantId);
    if (!contactInfo) {
      throw new NotFoundException('Contact info not found for this tenant');
    }

    await this.prisma.contactInfo.delete({
      where: { tenantId },
    });
  }

  // ==================== CONTACT SUBMISSIONS ====================

  async createSubmission(
    contactSubmissionDto: ContactSubmissionDto,
    tenantId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ContactSubmission> {
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

  async findSubmissions(
    tenantId: number,
    query: ContactSubmissionQueryDto = {},
  ): Promise<{
    submissions: ContactSubmission[];
    total: number;
    totalPages: number;
    currentPage: number;
    unreadCount: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      unreadOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const offset = (page - 1) * limit;

    const whereClause: any = { tenantId };

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

    const orderBy: any = {};
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

  async findSubmissionById(id: number, tenantId: number): Promise<ContactSubmission> {
    const submission = await this.prisma.contactSubmission.findFirst({
      where: { id, tenantId },
    });

    if (!submission) {
      throw new NotFoundException('Contact submission not found');
    }

    return submission;
  }

  async markSubmissionAsRead(id: number, tenantId: number): Promise<ContactSubmission> {
    // Verify submission exists and belongs to tenant
    await this.findSubmissionById(id, tenantId);

    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markSubmissionAsReplied(id: number, tenantId: number): Promise<ContactSubmission> {
    // Verify submission exists and belongs to tenant
    await this.findSubmissionById(id, tenantId);

    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isReplied: true, isRead: true },
    });
  }

  async deleteSubmission(id: number, tenantId: number): Promise<void> {
    // Verify submission exists and belongs to tenant
    await this.findSubmissionById(id, tenantId);

    await this.prisma.contactSubmission.delete({
      where: { id },
    });
  }

  async bulkDeleteSubmissions(ids: number[], tenantId: number): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.deleteSubmission(id, tenantId);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete submission ${id}:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }

  async getSubmissionStats(tenantId: number): Promise<{
    total: number;
    unread: number;
    replied: number;
    thisMonth: number;
  }> {
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
}