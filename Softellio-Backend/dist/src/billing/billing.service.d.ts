import { PrismaService } from '../config/prisma.service';
import { PlanDto, SubscriptionDto, MockCheckoutDto } from './dto/billing.dto';
export declare class BillingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlans(): Promise<PlanDto[]>;
    getSubscription(tenantId: number): Promise<SubscriptionDto>;
    mockCheckout(tenantId: number, checkoutData: MockCheckoutDto): Promise<SubscriptionDto>;
    hasActiveSubscription(tenantId: number): Promise<boolean>;
}
