import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PlanDto, SubscriptionDto, MockCheckoutDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * GET /billing/plans
   * Get all available subscription plans (static list for MVP)
   */
  @Get('plans')
  async getPlans(): Promise<PlanDto[]> {
    return this.billingService.getPlans();
  }

  /**
   * GET /billing/subscription/me
   * Get current subscription details for the tenant (reads from JWT + tenant header)
   */
  @Get('subscription/me')
  async getMySubscription(@CurrentTenant() tenantId: number): Promise<SubscriptionDto> {
    return this.billingService.getSubscription(tenantId);
  }

  /**
   * POST /billing/checkout/mock
   * TEST ONLY: Mock checkout process
   * Sets subscription to active with 1 year period
   */
  @Post('checkout/mock')
  async mockCheckout(
    @CurrentTenant() tenantId: number,
    @Body() checkoutData: MockCheckoutDto,
  ): Promise<SubscriptionDto> {
    return this.billingService.mockCheckout(tenantId, checkoutData);
  }

}