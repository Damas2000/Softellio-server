import { BillingService } from './billing.service';
import { PlanDto, SubscriptionDto, MockCheckoutDto } from './dto/billing.dto';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getPlans(): Promise<PlanDto[]>;
    getMySubscription(tenantId: number): Promise<SubscriptionDto>;
    mockCheckout(tenantId: number, checkoutData: MockCheckoutDto): Promise<SubscriptionDto>;
}
