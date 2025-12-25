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
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto, TeamMemberQueryDto, BulkTeamMemberDeleteDto, TeamMemberReorderDto } from './dto/team-member.dto';
import { BulkDeleteDto, BulkDeleteResponseDto } from '../common/dto/bulk-delete.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Team Members')
@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  // ==================== ADMIN ROUTES ====================

  @Post('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create new team member (Admin)' })
  @ApiResponse({ status: 201, description: 'Team member created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() createTeamMemberDto: CreateTeamMemberDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.create(createTeamMemberDto, tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all team members with filtering (Admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiQuery({ name: 'sortBy', enum: ['order', 'createdAt', 'updatedAt', 'name'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  @ApiResponse({ status: 200, description: 'Team members retrieved successfully' })
  findAll(
    @CurrentTenant() tenantId: number,
    @Query() query: TeamMemberQueryDto,
  ) {
    return this.teamMembersService.findAll(tenantId, query);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get team members statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Team members statistics retrieved successfully' })
  getStats(@CurrentTenant() tenantId: number) {
    return this.teamMembersService.getStats(tenantId);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get team member by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Team member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.findOne(id, tenantId);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update team member (Admin)' })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.update(id, updateTeamMemberDto, tenantId);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete team member (Admin)' })
  @ApiResponse({ status: 200, description: 'Team member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.remove(id, tenantId);
  }

  @Post('admin/bulk-delete')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk delete team members (Admin)' })
  @ApiBody({ type: BulkDeleteDto, description: 'Array of team member IDs to delete' })
  @ApiResponse({ status: 200, type: BulkDeleteResponseDto, description: 'Team members deleted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.bulkDelete(bulkDeleteDto.ids, tenantId);
  }

  @Delete('admin/bulk')
  @Public()
  @ApiExcludeEndpoint()
  bulkDeleteDeprecated(@Body() body: any): never {
    throw new GoneException('This endpoint is deprecated. Use POST /team-members/admin/bulk-delete');
  }

  @Patch('admin/reorder')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder team members (Admin)' })
  @ApiResponse({ status: 200, description: 'Team members reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body or validation error' })
  reorder(
    @Body() reorderDto: TeamMemberReorderDto,
    @CurrentTenant() tenantId: number,
  ) {
    return this.teamMembersService.reorder(reorderDto.teamMembers, tenantId);
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:language')
  @Public()
  @ApiOperation({ summary: 'Get public team members for specific language' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Public team members retrieved successfully' })
  findPublic(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
    @Query() query: TeamMemberQueryDto,
  ) {
    return this.teamMembersService.findPublicTeamMembers(tenantId, language, query);
  }

  @Get('public/:language/leadership')
  @Public()
  @ApiOperation({ summary: 'Get leadership team (top 3 by order)' })
  @ApiResponse({ status: 200, description: 'Leadership team retrieved successfully' })
  async getLeadership(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const result = await this.teamMembersService.findPublicTeamMembers(
      tenantId,
      language,
      { limit: 3, sortBy: 'order', sortOrder: 'asc' }
    );

    return { leadership: result.teamMembers };
  }

  // ==================== VCARD ROUTES ====================

  @Get('public/:language/:id/vcard')
  @Public()
  @ApiOperation({ summary: 'Get vCard data for team member' })
  @ApiResponse({ status: 200, description: 'vCard data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async getVCard(
    @Param('language') language: string,
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() tenantId: number,
  ) {
    const teamMember = await this.teamMembersService.findOne(id, tenantId);

    if (!teamMember.isActive) {
      return { vcard: null };
    }

    const translation = teamMember.translations.find(t => t.language === language);

    if (!translation) {
      return { vcard: null };
    }

    // Generate vCard data
    const vCardData = {
      name: translation.name,
      position: translation.position,
      phone: teamMember.phone,
      email: teamMember.email,
      bio: translation.bio,
      expertise: translation.expertise,
      photoUrl: teamMember.imageUrl,
      socialLinks: teamMember.socialLinks.filter(link => link.isActive),
    };

    return { vcard: vCardData };
  }

  // ==================== DIRECTORY ROUTES ====================

  @Get('public/:language/directory')
  @Public()
  @ApiOperation({ summary: 'Get team directory with contact info' })
  @ApiResponse({ status: 200, description: 'Team directory retrieved successfully' })
  async getDirectory(
    @Param('language') language: string,
    @CurrentTenant() tenantId: number,
  ) {
    const result = await this.teamMembersService.findPublicTeamMembers(
      tenantId,
      language,
      { limit: 1000 } // Large limit to get all members
    );

    const directory = result.teamMembers.map(member => ({
      id: member.id,
      name: member.translation?.name || 'Unknown',
      position: member.translation?.position || 'Position not available',
      email: member.email,
      phone: member.phone,
      imageUrl: member.imageUrl,
      socialLinks: member.socialLinks,
    }));

    return { directory };
  }

  // ==================== EXPERTISE ROUTES ====================

  @Get('public/:language/expertise/:expertise')
  @Public()
  @ApiOperation({ summary: 'Get team members by expertise area' })
  @ApiResponse({ status: 200, description: 'Team members by expertise retrieved successfully' })
  async getByExpertise(
    @Param('language') language: string,
    @Param('expertise') expertise: string,
    @CurrentTenant() tenantId: number,
  ) {
    const allMembers = await this.teamMembersService.findPublicTeamMembers(
      tenantId,
      language,
      { limit: 1000 }
    );

    const expertMembers = allMembers.teamMembers.filter(member =>
      member.translation?.expertise?.toLowerCase().includes(expertise.toLowerCase())
    );

    return { teamMembers: expertMembers, expertise };
  }
}