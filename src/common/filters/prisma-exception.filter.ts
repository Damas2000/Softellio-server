import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: HttpStatus;
    let message: string;

    // Log the original error for debugging
    this.logger.error(`Prisma error ${exception.code}: ${exception.message}`, {
      code: exception.code,
      meta: exception.meta,
      url: request.url,
      method: request.method,
    });

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = this.getUniqueConstraintMessage(exception);
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = this.getForeignKeyConstraintMessage(exception);
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'The requested resource was not found or has been deleted.';
        break;

      case 'P2014':
        // Invalid value for field
        status = HttpStatus.BAD_REQUEST;
        message = this.getInvalidFieldMessage(exception);
        break;

      case 'P2016':
        // Query interpretation error
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid query parameters provided.';
        break;

      case 'P2021':
        // Table does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database configuration error. Please contact support.';
        break;

      case 'P2022':
        // Column does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database schema error. Please contact support.';
        break;

      case 'P2023':
        // Inconsistent column data
        status = HttpStatus.BAD_REQUEST;
        message = 'Data format is inconsistent with expected schema.';
        break;

      case 'P2024':
        // Connection timed out
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'Database connection timed out. Please try again.';
        break;

      case 'P2034':
        // Transaction conflict
        status = HttpStatus.CONFLICT;
        message = 'Data was modified by another process. Please refresh and try again.';
        break;

      default:
        // Generic Prisma error
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected database error occurred. Please try again or contact support.';
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: this.getErrorName(status),
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getUniqueConstraintMessage(exception: PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;

    if (Array.isArray(target)) {
      const fields = target.join(', ');

      // Handle specific constraint patterns
      if (fields.includes('email')) {
        return 'An account with this email address already exists.';
      }

      if (fields.includes('slug')) {
        return 'A resource with this URL slug already exists. Please choose a different one.';
      }

      if (fields.includes('key')) {
        return 'A resource with this key already exists. Please choose a different one.';
      }

      if (fields.includes('domain')) {
        return 'This domain is already in use. Please choose a different domain.';
      }

      if (fields.includes('tenantId') && fields.includes('language')) {
        return 'A translation for this language already exists for this content.';
      }

      return `A resource with the specified ${fields} already exists.`;
    }

    return 'A resource with these details already exists. Please modify your input.';
  }

  private getForeignKeyConstraintMessage(exception: PrismaClientKnownRequestError): string {
    const fieldName = exception.meta?.field_name as string;

    if (fieldName?.includes('pageId') || fieldName?.includes('page_id')) {
      return 'The specified page does not exist or is not accessible.';
    }

    if (fieldName?.includes('tenantId') || fieldName?.includes('tenant_id')) {
      return 'The specified tenant does not exist or is not accessible.';
    }

    if (fieldName?.includes('parentId') || fieldName?.includes('parent_id')) {
      return 'The specified parent resource does not exist or is not accessible.';
    }

    if (fieldName?.includes('menuId') || fieldName?.includes('menu_id')) {
      return 'The specified menu does not exist or is not accessible.';
    }

    if (fieldName?.includes('userId') || fieldName?.includes('user_id')) {
      return 'The specified user does not exist or is not accessible.';
    }

    return 'The referenced resource does not exist or is not accessible.';
  }

  private getInvalidFieldMessage(exception: PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;

    if (target) {
      return `Invalid value provided for field: ${target}`;
    }

    return 'One or more fields contain invalid values.';
  }

  private getErrorName(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.REQUEST_TIMEOUT:
        return 'Request Timeout';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}