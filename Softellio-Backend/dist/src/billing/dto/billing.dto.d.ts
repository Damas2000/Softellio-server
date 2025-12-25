export declare enum SubscriptionStatusEnum {
    TRIAL = "trial",
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELED = "canceled",
    PAST_DUE = "past_due"
}
export declare enum PlanKeyEnum {
    BASIC = "basic",
    PRO = "pro",
    CUSTOM = "custom"
}
export declare class PlanDto {
    key: PlanKeyEnum;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features?: string[];
}
export declare class SubscriptionDto {
    subscriptionStatus: SubscriptionStatusEnum;
    planKey: PlanKeyEnum;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    daysRemaining?: number;
}
export declare class MockCheckoutDto {
    planKey: PlanKeyEnum;
}
