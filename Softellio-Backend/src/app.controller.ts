import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-12-20T18:54:06.323Z' },
        uptime: { type: 'number', example: 1234.56 },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  getHealth() {
    console.log('🩺 Health endpoint hit!');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}