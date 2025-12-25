import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  GoneException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ContactInfoService } from './contact-info.service';
import {
  CreateContactInfoDto,
  UpdateContactInfoDto,
  ContactSubmissionDto,
  ContactSubmissionQueryDto
} from './dto/contact-info.dto';
import { BulkDeleteDto, BulkDeleteResponseDto } from '../common/dto/bulk-delete.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Contact Info')
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  // ==================== ADMIN ROUTES - CONTACT INFO ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create contact information (Admin)' })
  @ApiResponse({ status: 201, description: 'Contact info created successfully' })
  @ApiResponse({ status: 409, description: 'Contact info already exists' })
  create(
    @Body() createContactInfoDto: CreateContactInfoDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.create(createContactInfoDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get contact information with all data (Admin)' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  findAll(@CurrentTenant() tenantId: number) {
    return this.contactInfoService.findByTenant(tenantId);
  }

  @Get('admin/:language')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get contact info for specific language (Admin)' })
  @ApiResponse({ status: 200, description: 'Contact info for language retrieved successfully' })
  findByLanguage(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.findByTenantAndLanguage(tenantId, language);
  }

  @Patch('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update contact information (Admin)' })
  @ApiResponse({ status: 200, description: 'Contact info updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  update(
    @Body() updateContactInfoDto: UpdateContactInfoDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.update(tenantId, updateContactInfoDto);
  }

  @Delete('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete contact information (Admin)' })
  @ApiResponse({ status: 200, description: 'Contact info deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  remove(@CurrentTenant() tenantId: number) {
    return this.contactInfoService.delete(tenantId);
  }

  // ==================== ADMIN ROUTES - CONTACT SUBMISSIONS ====================

  @Get('admin/submissions')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get contact form submissions (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'unreadOnly', type: Boolean, required: false, description: 'Show only unread submissions' })
  @ApiQuery({ name: 'sortBy', enum: ['createdAt', 'name', 'email'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'Contact submissions retrieved successfully' })
  findSubmissions(
    @CurrentTenant() tenantId: number,
    @Query() query: ContactSubmissionQueryDto,
  ) {
    return this.contactInfoService.findSubmissions(tenantId, query);
  }

  @Get('admin/submissions/stats')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get contact submissions statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Submissions statistics retrieved successfully' })
  getSubmissionStats(@CurrentTenant() tenantId: number) {
    return this.contactInfoService.getSubmissionStats(tenantId);
  }

  @Get('admin/submissions/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get contact submission by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Contact submission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  findSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.findSubmissionById(id, tenantId);
  }

  @Patch('admin/submissions/:id/read')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Mark submission as read (Admin)' })
  @ApiResponse({ status: 200, description: 'Submission marked as read successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.markSubmissionAsRead(id, tenantId);
  }

  @Patch('admin/submissions/:id/replied')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Mark submission as replied (Admin)' })
  @ApiResponse({ status: 200, description: 'Submission marked as replied successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  markAsReplied(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.markSubmissionAsReplied(id, tenantId);
  }

  @Delete('admin/submissions/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete contact submission (Admin)' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  deleteSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.deleteSubmission(id, tenantId);
  }

  @Post('admin/submissions/bulk-delete')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete contact submissions (Admin)' })
  @ApiBody({ type: BulkDeleteDto, description: 'Array of submission IDs to delete' })
  @ApiResponse({ status: 200, type: BulkDeleteResponseDto, description: 'Submissions deleted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  bulkDeleteSubmissions(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.contactInfoService.bulkDeleteSubmissions(bulkDeleteDto.ids, tenantId);
  }

  @Delete('admin/submissions/bulk')
  @Public()
  @ApiExcludeEndpoint()
  bulkDeleteSubmissionsDeprecated(@Body() body: any): never {
    throw new GoneException('This endpoint is deprecated. Use POST /contact-info/admin/submissions/bulk-delete');
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public contact information for default language' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (defaults to tenant default language)'
  })
  @ApiResponse({ status: 200, description: 'Public contact info retrieved successfully' })
  async getPublicContactInfo(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
  ) {
    // Default to Turkish if no language specified
    const lang = language || 'tr';

    const contactInfo = await this.contactInfoService.findByTenantAndLanguage(tenantId, lang);

    if (!contactInfo || !contactInfo.translation) {
      return {
        companyName: 'Company Name',
        tagline: null,
        description: null,
        workingHours: null,
        offices: [],
        socialLinks: [],
        logo: null,
        favicon: null,
      };
    }

    return {
      companyName: contactInfo.translation.companyName,
      tagline: contactInfo.translation.tagline,
      description: contactInfo.translation.description,
      workingHours: contactInfo.translation.workingHours,
      offices: contactInfo.offices,
      socialLinks: contactInfo.socialLinks,
      logo: contactInfo.logo,
      favicon: contactInfo.favicon,
    };
  }

  @Get('public/offices')
  @Public()
  @ApiOperation({ summary: 'Get all active offices' })
  @ApiResponse({ status: 200, description: 'Active offices retrieved successfully' })
  async getPublicOffices(@CurrentTenant() tenantId: number) {
    const contactInfo = await this.contactInfoService.findByTenant(tenantId);

    if (!contactInfo) {
      return { offices: [] };
    }

    const activeOffices = contactInfo.offices
      .filter(office => office.isActive)
      .sort((a, b) => {
        // Primary office first, then by order
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.order || 0) - (b.order || 0);
      });

    return { offices: activeOffices };
  }

  @Get('public/social-links')
  @Public()
  @ApiOperation({ summary: 'Get all active social media links' })
  @ApiResponse({ status: 200, description: 'Social links retrieved successfully' })
  async getPublicSocialLinks(@CurrentTenant() tenantId: number) {
    const contactInfo = await this.contactInfoService.findByTenant(tenantId);

    if (!contactInfo) {
      return { socialLinks: [] };
    }

    const activeSocialLinks = contactInfo.socialLinks
      .filter(link => link.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return { socialLinks: activeSocialLinks };
  }

  @Post('public/contact')
  @Public()
  @ApiOperation({ summary: 'Submit contact form (Public)' })
  @ApiResponse({ status: 201, description: 'Contact form submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async submitContact(
    @Body() contactSubmissionDto: ContactSubmissionDto,
    @CurrentTenant() tenantId: number,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');

    const submission = await this.contactInfoService.createSubmission(
      contactSubmissionDto,
      tenantId,
      ipAddress,
      userAgent,
    );

    // Return success message without sensitive submission data
    return {
      message: 'Contact form submitted successfully',
      submissionId: submission.id,
      submittedAt: submission.createdAt,
    };
  }

  // ==================== BUSINESS CARD / VCARD ROUTES ====================

  @Get('public/vcard')
  @Public()
  @ApiOperation({ summary: 'Get vCard data for business card' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code for company name'
  })
  @ApiQuery({
    name: 'office',
    type: Number,
    required: false,
    description: 'Specific office ID (defaults to primary office)'
  })
  @ApiResponse({ status: 200, description: 'vCard data retrieved successfully' })
  async getVCard(
    @CurrentTenant() tenantId: number,
    @Query('lang') language?: string,
    @Query('office') officeId?: number,
  ) {
    const lang = language || 'tr';
    const contactInfo = await this.contactInfoService.findByTenantAndLanguage(tenantId, lang);

    if (!contactInfo) {
      return { vcard: null };
    }

    let selectedOffice;
    if (officeId) {
      selectedOffice = contactInfo.offices.find(office => office.id === officeId);
    } else {
      selectedOffice = contactInfo.offices.find(office => office.isPrimary) || contactInfo.offices[0];
    }

    // Generate vCard data
    const vCardData = {
      companyName: contactInfo.translation?.companyName || 'Company',
      phone: selectedOffice?.phone || '',
      email: selectedOffice?.email || '',
      address: selectedOffice?.address || '',
      website: '', // You might want to add website field to your schema
      socialLinks: contactInfo.socialLinks,
    };

    return { vcard: vCardData };
  }
}