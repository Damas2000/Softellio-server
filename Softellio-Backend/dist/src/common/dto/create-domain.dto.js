"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDomainDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function normalizeDomain(value) {
    if (!value || typeof value !== 'string') {
        return value;
    }
    let normalized = value.toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.split('/')[0];
    normalized = normalized.replace(/\.+$/, '');
    normalized = normalized.split(':')[0];
    return normalized;
}
function isValidDomainFormat(domain) {
    if (!domain)
        return false;
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
        return false;
    }
    if (!domain.includes('.')) {
        return false;
    }
    if (domain.startsWith('-') || domain.endsWith('-')) {
        return false;
    }
    const segments = domain.split('.');
    for (const segment of segments) {
        if (segment.startsWith('-') || segment.endsWith('-') || segment.length === 0) {
            return false;
        }
    }
    return true;
}
const RESERVED_DOMAINS = [
    'softellio.com',
    'platform.softellio.com',
    'portal.softellio.com',
    'api.softellio.com',
    'admin.softellio.com',
    'connect.softellio.com',
    'app.softellio.com',
    'dashboard.softellio.com',
    'mail.softellio.com',
    'localhost'
];
function isNotReservedDomain(domain) {
    if (!domain)
        return true;
    const normalized = domain.toLowerCase();
    if (RESERVED_DOMAINS.includes(normalized)) {
        return false;
    }
    if (normalized.endsWith('.softellio.com')) {
        return false;
    }
    return true;
}
class CreateDomainDto {
    constructor() {
        this.isPrimary = false;
        this.type = client_1.DomainType.CUSTOM;
    }
}
exports.CreateDomainDto = CreateDomainDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'hamza.com',
        description: 'The custom domain to add to the tenant. Must be a valid domain without protocol or paths.',
        maxLength: 253,
    }),
    (0, class_validator_1.IsString)({ message: 'Domain must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Domain is required' }),
    (0, class_validator_1.MaxLength)(253, { message: 'Domain must not exceed 253 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        const normalized = normalizeDomain(value);
        if (!isValidDomainFormat(normalized)) {
            throw new common_1.BadRequestException('Invalid domain format. Please provide a valid domain name without protocol, paths, or special characters (e.g., example.com, www.example.com)');
        }
        if (!isNotReservedDomain(normalized)) {
            throw new common_1.BadRequestException('This domain is reserved and cannot be used. Softellio.com subdomains are not allowed for custom domains.');
        }
        return normalized;
    }),
    (0, class_validator_1.Matches)(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, {
        message: 'Invalid domain format. Domain must contain only letters, numbers, hyphens, and dots.'
    }),
    __metadata("design:type", String)
], CreateDomainDto.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether this domain should be set as the primary domain for the tenant',
        required: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isPrimary must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateDomainDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.DomainType.CUSTOM,
        description: 'The type of domain being added',
        enum: client_1.DomainType,
        required: false,
        default: client_1.DomainType.CUSTOM,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DomainType, { message: 'Type must be either CUSTOM or SYSTEM' }),
    __metadata("design:type", String)
], CreateDomainDto.prototype, "type", void 0);
//# sourceMappingURL=create-domain.dto.js.map