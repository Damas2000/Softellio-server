import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SectionTypesService } from './section-types.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Section Types & Validation')
@Controller('section-types')
export class SectionTypesController {
  constructor(private readonly sectionTypesService: SectionTypesService) {}

  // ==================== PUBLIC ROUTES ====================

  @Get('available')
  @Public()
  @ApiOperation({
    summary: 'Get all available section types (Public)',
    description: 'Returns all available section types with their configurations'
  })
  @ApiResponse({
    status: 200,
    description: 'Available section types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'hero' },
          displayName: { type: 'string', example: 'Hero Section' },
          description: { type: 'string', example: 'Main banner/hero section' },
          category: { type: 'string', example: 'content' },
          variants: { type: 'array' },
          defaultVariant: { type: 'string', example: 'v1' },
          icon: { type: 'string', example: 'star' },
          isAvailable: { type: 'boolean', example: true },
        },
      },
    },
  })
  getAvailableTypes() {
    return this.sectionTypesService.getAvailableTypes();
  }

  @Get('by-category')
  @Public()
  @ApiOperation({
    summary: 'Get section types grouped by category (Public)',
    description: 'Returns section types organized by category (content, data, layout, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Section types grouped by category',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'array', items: { type: 'object' } },
        data: { type: 'array', items: { type: 'object' } },
        layout: { type: 'array', items: { type: 'object' } },
        media: { type: 'array', items: { type: 'object' } },
        navigation: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  getTypesByCategory() {
    return this.sectionTypesService.getTypesByCategory();
  }

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search section types (Public)',
    description: 'Search section types by keyword in name, description, or category'
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
    example: 'hero',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching section types',
  })
  searchTypes(@Query('q') query: string) {
    return this.sectionTypesService.searchTypes(query);
  }

  @Get('context/:context')
  @Public()
  @ApiOperation({
    summary: 'Get section types for specific context (Public)',
    description: 'Get section types suitable for homepage, page, footer, or header'
  })
  @ApiParam({
    name: 'context',
    description: 'Context type',
    enum: ['homepage', 'page', 'footer', 'header'],
    example: 'homepage',
  })
  @ApiResponse({
    status: 200,
    description: 'Section types for context',
  })
  getTypesForContext(@Param('context') context: 'homepage' | 'page' | 'footer' | 'header') {
    return this.sectionTypesService.getTypesForContext(context);
  }

  @Get(':type')
  @Public()
  @ApiOperation({
    summary: 'Get section type configuration (Public)',
    description: 'Get detailed configuration for specific section type'
  })
  @ApiParam({
    name: 'type',
    description: 'Section type',
    example: 'hero',
  })
  @ApiResponse({
    status: 200,
    description: 'Section type configuration',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'hero' },
        displayName: { type: 'string', example: 'Hero Section' },
        description: { type: 'string', example: 'Main banner/hero section' },
        category: { type: 'string', example: 'content' },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              variant: { type: 'string', example: 'v1' },
              displayName: { type: 'string', example: 'Centered Hero' },
              description: { type: 'string', example: 'Centered text with background' },
              propsSchema: { type: 'object' },
            },
          },
        },
        defaultVariant: { type: 'string', example: 'v1' },
        icon: { type: 'string', example: 'star' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Section type not found' })
  getTypeConfig(@Param('type') type: string) {
    const config = this.sectionTypesService.getTypeConfig(type);
    if (!config) {
      return { error: 'Section type not found', type };
    }
    return config;
  }

  @Get(':type/variants')
  @Public()
  @ApiOperation({
    summary: 'Get variants for section type (Public)',
    description: 'Get all available variants for a specific section type'
  })
  @ApiParam({
    name: 'type',
    description: 'Section type',
    example: 'hero',
  })
  @ApiResponse({
    status: 200,
    description: 'Section type variants',
  })
  getVariants(@Param('type') type: string) {
    return this.sectionTypesService.getVariants(type);
  }

  @Get(':type/:variant/schema')
  @Public()
  @ApiOperation({
    summary: 'Get schema for section type/variant (Public)',
    description: 'Get props schema and defaults for form generation'
  })
  @ApiParam({ name: 'type', description: 'Section type', example: 'hero' })
  @ApiParam({ name: 'variant', description: 'Section variant', example: 'v1' })
  @ApiResponse({
    status: 200,
    description: 'Section schema for editor',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'hero' },
        variant: { type: 'string', example: 'v1' },
        displayName: { type: 'string', example: 'Centered Hero' },
        description: { type: 'string', example: 'Centered text with background' },
        schema: {
          type: 'object',
          properties: {
            required: { type: 'array', items: { type: 'string' } },
            properties: { type: 'object' },
          },
        },
        defaults: { type: 'object', example: { textAlign: 'center' } },
      },
    },
  })
  getSchemaForEditor(@Param('type') type: string, @Param('variant') variant: string) {
    return this.sectionTypesService.getSchemaForEditor(type, variant);
  }

  // ==================== ADMIN ROUTES ====================

  @Post('validate')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Validate section props (Admin)',
    description: 'Validate section properties against schema'
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: true },
        errors: { type: 'array', items: { type: 'string' } },
        type: { type: 'string', example: 'hero' },
        variant: { type: 'string', example: 'v1' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  validateProps(
    @Body() body: {
      type: string;
      variant: string;
      props: any;
    }
  ) {
    const validation = this.sectionTypesService.validateProps(body.type, body.variant, body.props);
    return {
      ...validation,
      type: body.type,
      variant: body.variant,
    };
  }

  @Get('admin/statistics')
  @ApiBearerAuth()
  @Roles(Role.TENANT_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Get section types statistics (Admin)',
    description: 'Get statistics about available section types'
  })
  @ApiResponse({
    status: 200,
    description: 'Section types statistics',
    schema: {
      type: 'object',
      properties: {
        totalTypes: { type: 'number', example: 8 },
        categoryCounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'content' },
              count: { type: 'number', example: 4 },
              types: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        mostVariants: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'hero' },
            variants: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  getStatistics() {
    return this.sectionTypesService.getTypeStatistics();
  }
}