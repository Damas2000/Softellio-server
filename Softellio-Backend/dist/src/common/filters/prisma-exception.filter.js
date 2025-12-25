"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let PrismaExceptionFilter = PrismaExceptionFilter_1 = class PrismaExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(PrismaExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        this.logger.error(`Prisma error ${exception.code}: ${exception.message}`, {
            code: exception.code,
            meta: exception.meta,
            url: request.url,
            method: request.method,
        });
        switch (exception.code) {
            case 'P2002':
                status = common_1.HttpStatus.CONFLICT;
                message = this.getUniqueConstraintMessage(exception);
                break;
            case 'P2003':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = this.getForeignKeyConstraintMessage(exception);
                break;
            case 'P2025':
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'The requested resource was not found or has been deleted.';
                break;
            case 'P2014':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = this.getInvalidFieldMessage(exception);
                break;
            case 'P2016':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Invalid query parameters provided.';
                break;
            case 'P2021':
                status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'Database configuration error. Please contact support.';
                break;
            case 'P2022':
                status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'Database schema error. Please contact support.';
                break;
            case 'P2023':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Data format is inconsistent with expected schema.';
                break;
            case 'P2024':
                status = common_1.HttpStatus.REQUEST_TIMEOUT;
                message = 'Database connection timed out. Please try again.';
                break;
            case 'P2034':
                status = common_1.HttpStatus.CONFLICT;
                message = 'Data was modified by another process. Please refresh and try again.';
                break;
            default:
                status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
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
    getUniqueConstraintMessage(exception) {
        const target = exception.meta?.target;
        if (Array.isArray(target)) {
            const fields = target.join(', ');
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
    getForeignKeyConstraintMessage(exception) {
        const fieldName = exception.meta?.field_name;
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
    getInvalidFieldMessage(exception) {
        const target = exception.meta?.target;
        if (target) {
            return `Invalid value provided for field: ${target}`;
        }
        return 'One or more fields contain invalid values.';
    }
    getErrorName(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case common_1.HttpStatus.NOT_FOUND:
                return 'Not Found';
            case common_1.HttpStatus.CONFLICT:
                return 'Conflict';
            case common_1.HttpStatus.REQUEST_TIMEOUT:
                return 'Request Timeout';
            case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error';
            default:
                return 'Error';
        }
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = PrismaExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(library_1.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map