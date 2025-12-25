import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PlanDto, SubscriptionDto, PlanKeyEnum, SubscriptionStatusEnum, MockCheckoutDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<PlanDto[]> {
    // Static plans for MVP - no database storage yet
    return [
      {
        key: PlanKeyEnum.BASIC,
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
        key: PlanKeyEnum.PRO,
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
        key: PlanKeyEnum.CUSTOM,
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

  /**
   * Get subscription details for a tenant
   */
  async getSubscription(tenantId: number): Promise<SubscriptionDto> {
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
      throw new NotFoundException('Tenant not found');
    }

    // Calculate days remaining
    let daysRemaining = null;
    if (tenant.currentPeriodEnd) {
      const now = new Date();
      const endDate = new Date(tenant.currentPeriodEnd);
      const diffTime = endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      subscriptionStatus: tenant.subscriptionStatus as SubscriptionStatusEnum,
      planKey: tenant.planKey as PlanKeyEnum,
      currentPeriodStart: tenant.currentPeriodStart,
      currentPeriodEnd: tenant.currentPeriodEnd,
      daysRemaining,
    };
  }

  /**
   * Mock checkout process - for testing only
   * Sets subscription to active with 1 year period
   */
  async mockCheckout(tenantId: number, checkoutData: MockCheckoutDto): Promise<SubscriptionDto> {
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
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

    // Calculate days remaining (should be ~365)
    const diffTime = oneYearLater.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      subscriptionStatus: updatedTenant.subscriptionStatus as SubscriptionStatusEnum,
      planKey: updatedTenant.planKey as PlanKeyEnum,
      currentPeriodStart: updatedTenant.currentPeriodStart,
      currentPeriodEnd: updatedTenant.currentPeriodEnd,
      daysRemaining,
    };
  }

  /**
   * Check if tenant has active subscription
   */
  async hasActiveSubscription(tenantId: number): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscriptionStatus: true },
    });

    return tenant?.subscriptionStatus === SubscriptionStatusEnum.ACTIVE;
  }
}