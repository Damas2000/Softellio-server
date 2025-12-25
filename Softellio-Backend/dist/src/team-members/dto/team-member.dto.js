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
exports.TeamMemberOrderDto = exports.TeamMemberReorderDto = exports.BulkTeamMemberDeleteDto = exports.TeamMemberQueryDto = exports.UpdateTeamMemberDto = exports.CreateTeamMemberDto = exports.TeamMemberSocialLinkDto = exports.TeamMemberTranslationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class TeamMemberTranslationDto {
}
exports.TeamMemberTranslationDto = TeamMemberTranslationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tr',
        description: 'Language code for this translation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberTranslationDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ahmet Yılmaz',
        description: 'Team member name in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberTranslationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Genel Müdür',
        description: 'Position/title in this language'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberTranslationDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'İnşaat sektöründe 15 yıllık deneyime sahip...',
        description: 'Biography in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberTranslationDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Proje Yönetimi, İnşaat Mühendisliği, Kalite Kontrol',
        description: 'Areas of expertise in this language',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberTranslationDto.prototype, "expertise", void 0);
class TeamMemberSocialLinkDto {
    constructor() {
        this.isActive = true;
    }
}
exports.TeamMemberSocialLinkDto = TeamMemberSocialLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'linkedin',
        description: 'Social media platform'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberSocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://linkedin.com/in/ahmet-yilmaz',
        description: 'Social media profile URL'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], TeamMemberSocialLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'fab fa-linkedin',
        description: 'Icon class or URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberSocialLinkDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is this link active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], TeamMemberSocialLinkDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TeamMemberSocialLinkDto.prototype, "order", void 0);
class CreateTeamMemberDto {
    constructor() {
        this.isActive = true;
    }
}
exports.CreateTeamMemberDto = CreateTeamMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ahmet@company.com',
        description: 'Team member email',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTeamMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+90 533 123 45 67',
        description: 'Team member phone',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeamMemberDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/photos/ahmet.jpg',
        description: 'Profile photo URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateTeamMemberDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order (lower numbers appear first)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTeamMemberDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the team member is active',
        required: false,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], CreateTeamMemberDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TeamMemberTranslationDto],
        description: 'Translations for different languages'
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TeamMemberTranslationDto),
    __metadata("design:type", Array)
], CreateTeamMemberDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TeamMemberSocialLinkDto],
        description: 'Social media links',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TeamMemberSocialLinkDto),
    __metadata("design:type", Array)
], CreateTeamMemberDto.prototype, "socialLinks", void 0);
class UpdateTeamMemberDto {
}
exports.UpdateTeamMemberDto = UpdateTeamMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ahmet@company.com',
        description: 'Team member email',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateTeamMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+90 533 123 45 67',
        description: 'Team member phone',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamMemberDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/photos/ahmet.jpg',
        description: 'Profile photo URL',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateTeamMemberDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateTeamMemberDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether the team member is active',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UpdateTeamMemberDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TeamMemberTranslationDto],
        description: 'Updated translations for different languages',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TeamMemberTranslationDto),
    __metadata("design:type", Array)
], UpdateTeamMemberDto.prototype, "translations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TeamMemberSocialLinkDto],
        description: 'Updated social media links',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TeamMemberSocialLinkDto),
    __metadata("design:type", Array)
], UpdateTeamMemberDto.prototype, "socialLinks", void 0);
class TeamMemberQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'order';
        this.sortOrder = 'asc';
    }
}
exports.TeamMemberQueryDto = TeamMemberQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Page number for pagination',
        required: false,
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TeamMemberQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Number of items per page',
        required: false,
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TeamMemberQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ahmet',
        description: 'Search term for team member name or position',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'order',
        description: 'Field to sort by',
        enum: ['order', 'createdAt', 'updatedAt', 'name'],
        required: false,
        default: 'order'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'asc',
        description: 'Sort order',
        enum: ['asc', 'desc'],
        required: false,
        default: 'asc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamMemberQueryDto.prototype, "sortOrder", void 0);
class BulkTeamMemberDeleteDto {
}
exports.BulkTeamMemberDeleteDto = BulkTeamMemberDeleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of team member IDs to delete',
        example: [1, 2, 3],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)({ message: 'IDs must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one team member ID is required' }),
    (0, class_validator_1.IsInt)({ each: true, message: 'Each ID must be a valid integer' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], BulkTeamMemberDeleteDto.prototype, "ids", void 0);
class TeamMemberReorderDto {
}
exports.TeamMemberReorderDto = TeamMemberReorderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of team members with their new order',
        example: [{ id: 1, order: 1 }, { id: 2, order: 2 }],
        type: [Object],
    }),
    (0, class_validator_1.IsArray)({ message: 'Team members must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one team member is required' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TeamMemberOrderDto),
    __metadata("design:type", Array)
], TeamMemberReorderDto.prototype, "teamMembers", void 0);
class TeamMemberOrderDto {
}
exports.TeamMemberOrderDto = TeamMemberOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Team member ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'ID must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TeamMemberOrderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New order position',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)({}, { message: 'Order must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TeamMemberOrderDto.prototype, "order", void 0);
//# sourceMappingURL=team-member.dto.js.map