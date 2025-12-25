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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const billing_dto_1 = require("./dto/billing.dto");
let BillingService = class BillingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlans() {
        return [
            {
                key: billing_dto_1.PlanKeyEnum.BASIC,
                name: 'Basic Plan',
                description: 'Perfect for small businesses',
                price: 29.99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Up to 5 pages',
                    'Basic SEO tools',
                    'Standard support',
                    'Basic analytics',
                ],
            },
            {
                key: billing_dto_1.PlanKeyEnum.PRO,
                name: 'Pro Plan',
                description: 'For growing businesses',
                price: 99.99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Unlimited pages',
                    'Advanced SEO tools',
                    'Priority support',
                    'Advanced analytics',
                    'Custom themes',
                    'Team collaboration',
                ],
            },
            {
                key: billing_dto_1.PlanKeyEnum.CUSTOM,
                name: 'Custom Plan',
                description: 'Tailored for enterprise',
                price: 299.99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Everything in Pro',
                    'Custom development',
                    'Dedicated support',
                    'White-label solution',
                    'Advanced integrations',
                ],
            },
        ];
    }
    async getSubscription(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                subscriptionStatus: true,
                planKey: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        let daysRemaining = null;
        if (tenant.currentPeriodEnd) {
            const now = new Date();
            const endDate = new Date(tenant.currentPeriodEnd);
            const diffTime = endDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
        return {
            subscriptionStatus: tenant.subscriptionStatus,
            planKey: tenant.planKey,
            currentPeriodStart: tenant.currentPeriodStart,
            currentPeriodEnd: tenant.currentPeriodEnd,
            daysRemaining,
        };
    }
    async mockCheckout(tenantId, checkoutData) {
        const now = new Date();
        const oneYearLater = new Date(now);
        oneYearLater.setFullYear(now.getFullYear() + 1);
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                subscriptionStatus: billing_dto_1.SubscriptionStatusEnum.ACTIVE,
                planKey: checkoutData.planKey,
                currentPeriodStart: now,
                currentPeriodEnd: oneYearLater,
            },
            select: {
                subscriptionStatus: true,
                planKey: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
            },
        });
        const diffTime = oneYearLater.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            subscriptionStatus: updatedTenant.subscriptionStatus,
            planKey: updatedTenant.planKey,
            currentPeriodStart: updatedTenant.currentPeriodStart,
            currentPeriodEnd: updatedTenant.currentPeriodEnd,
            daysRemaining,
        };
    }
    async hasActiveSubscription(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { subscriptionStatus: true },
        });
        return tenant?.subscriptionStatus === billing_dto_1.SubscriptionStatusEnum.ACTIVE;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map