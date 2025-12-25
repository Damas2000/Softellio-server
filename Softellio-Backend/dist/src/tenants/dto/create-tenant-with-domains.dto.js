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
exports.CreateTenantWithDomainsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTenantWithDomainsDto {
}
exports.CreateTenantWithDomainsDto = CreateTenantWithDomainsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Reis İnşaat',
        description: 'Company name (will be used to generate slug and domains)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Default language code',
        default: 'tr',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "defaultLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['tr', 'en'],
        description: 'Array of available language codes',
        default: ['tr'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTenantWithDomainsDto.prototype, "availableLanguages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#007bff',
        description: 'Primary color for the tenant',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "primaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'admin@reisinsaat.com',
        description: 'Email for the tenant admin user',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid admin email address' }),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "adminEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SecurePassword123!',
        description: 'Password for the tenant admin user',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Admin password must be at least 6 characters long' }),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "adminPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Admin Name',
        description: 'Name for the tenant admin user',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantWithDomainsDto.prototype, "adminName", void 0);
//# sourceMappingURL=create-tenant-with-domains.dto.js.map