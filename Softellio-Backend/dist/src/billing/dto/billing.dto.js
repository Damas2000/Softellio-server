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
exports.MockCheckoutDto = exports.SubscriptionDto = exports.PlanDto = exports.PlanKeyEnum = exports.SubscriptionStatusEnum = void 0;
const class_validator_1 = require("class-validator");
var SubscriptionStatusEnum;
(function (SubscriptionStatusEnum) {
    SubscriptionStatusEnum["TRIAL"] = "trial";
    SubscriptionStatusEnum["ACTIVE"] = "active";
    SubscriptionStatusEnum["EXPIRED"] = "expired";
    SubscriptionStatusEnum["CANCELED"] = "canceled";
    SubscriptionStatusEnum["PAST_DUE"] = "past_due";
})(SubscriptionStatusEnum || (exports.SubscriptionStatusEnum = SubscriptionStatusEnum = {}));
var PlanKeyEnum;
(function (PlanKeyEnum) {
    PlanKeyEnum["BASIC"] = "basic";
    PlanKeyEnum["PRO"] = "pro";
    PlanKeyEnum["CUSTOM"] = "custom";
})(PlanKeyEnum || (exports.PlanKeyEnum = PlanKeyEnum = {}));
class PlanDto {
}
exports.PlanDto = PlanDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PlanDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanDto.prototype, "interval", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PlanDto.prototype, "features", void 0);
class SubscriptionDto {
}
exports.SubscriptionDto = SubscriptionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "planKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SubscriptionDto.prototype, "daysRemaining", void 0);
class MockCheckoutDto {
}
exports.MockCheckoutDto = MockCheckoutDto;
__decorate([
    (0, class_validator_1.IsEnum)(PlanKeyEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MockCheckoutDto.prototype, "planKey", void 0);
//# sourceMappingURL=billing.dto.js.map