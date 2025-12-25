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
exports.VerifyDomainResponseDto = exports.DomainWithInstructionsDto = exports.DnsInstructionsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class DnsInstructionsDto {
}
exports.DnsInstructionsDto = DnsInstructionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DNS record type',
        example: 'TXT'
    }),
    __metadata("design:type", String)
], DnsInstructionsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DNS record host/name',
        example: '@'
    }),
    __metadata("design:type", String)
], DnsInstructionsDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DNS record value',
        example: 'softellio-verify=abc123def456'
    }),
    __metadata("design:type", String)
], DnsInstructionsDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Instructions for the user',
        example: 'Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap)'
    }),
    __metadata("design:type", String)
], DnsInstructionsDto.prototype, "instructions", void 0);
class DomainWithInstructionsDto {
}
exports.DomainWithInstructionsDto = DomainWithInstructionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Domain ID',
        example: 1
    }),
    __metadata("design:type", Number)
], DomainWithInstructionsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Domain name',
        example: 'hamza.com'
    }),
    __metadata("design:type", String)
], DomainWithInstructionsDto.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Domain type',
        enum: client_1.DomainType,
        example: client_1.DomainType.CUSTOM
    }),
    __metadata("design:type", String)
], DomainWithInstructionsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this domain is primary',
        example: false
    }),
    __metadata("design:type", Boolean)
], DomainWithInstructionsDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this domain is active',
        example: true
    }),
    __metadata("design:type", Boolean)
], DomainWithInstructionsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this domain is verified',
        example: false
    }),
    __metadata("design:type", Boolean)
], DomainWithInstructionsDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SSL status',
        enum: client_1.DomainSSLStatus,
        example: client_1.DomainSSLStatus.PENDING
    }),
    __metadata("design:type", String)
], DomainWithInstructionsDto.prototype, "sslStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the domain was verified',
        example: null,
        required: false
    }),
    __metadata("design:type", Date)
], DomainWithInstructionsDto.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DNS verification instructions',
        type: DnsInstructionsDto
    }),
    __metadata("design:type", DnsInstructionsDto)
], DomainWithInstructionsDto.prototype, "dnsInstructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the domain was created',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], DomainWithInstructionsDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the domain was last updated',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], DomainWithInstructionsDto.prototype, "updatedAt", void 0);
class VerifyDomainResponseDto {
}
exports.VerifyDomainResponseDto = VerifyDomainResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Verification status',
        enum: ['verified', 'pending', 'failed'],
        example: 'verified'
    }),
    __metadata("design:type", String)
], VerifyDomainResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Verification message',
        example: 'Domain successfully verified!'
    }),
    __metadata("design:type", String)
], VerifyDomainResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DNS records that were checked',
        example: ['TXT @ softellio-verify=abc123def456']
    }),
    __metadata("design:type", Array)
], VerifyDomainResponseDto.prototype, "checkedRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When verification was completed (if successful)',
        example: '2024-01-15T10:35:00Z',
        required: false
    }),
    __metadata("design:type", Date)
], VerifyDomainResponseDto.prototype, "verifiedAt", void 0);
//# sourceMappingURL=domain-response.dto.js.map