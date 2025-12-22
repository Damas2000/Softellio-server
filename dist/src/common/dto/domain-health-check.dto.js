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
exports.DomainHealthCheckDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DomainHealthCheckDto {
}
exports.DomainHealthCheckDto = DomainHealthCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'example.com',
        description: 'The domain that was checked',
    }),
    __metadata("design:type", String)
], DomainHealthCheckDto.prototype, "domain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the domain is reachable',
    }),
    __metadata("design:type", Boolean)
], DomainHealthCheckDto.prototype, "isReachable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 250,
        description: 'Response time in milliseconds',
        nullable: true,
    }),
    __metadata("design:type", Number)
], DomainHealthCheckDto.prototype, "responseTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 200,
        description: 'HTTP status code',
        nullable: true,
    }),
    __metadata("design:type", Number)
], DomainHealthCheckDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        description: 'Error message if domain is not reachable',
        nullable: true,
    }),
    __metadata("design:type", String)
], DomainHealthCheckDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-12-22T10:30:00Z',
        description: 'Timestamp when the check was performed',
    }),
    __metadata("design:type", Date)
], DomainHealthCheckDto.prototype, "checkedAt", void 0);
//# sourceMappingURL=domain-health-check.dto.js.map