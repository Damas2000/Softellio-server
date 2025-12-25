import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum SubscriptionStatusEnum {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
}

export enum PlanKeyEnum {
  BASIC = 'basic',
  PRO = 'pro',
  CUSTOM = 'custom',
}

export class PlanDto {
  @IsNotEmpty()
  key: PlanKeyEnum;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  interval: string;

  @IsOptional()
  features?: string[];
}

export class SubscriptionDto {
  @IsNotEmpty()
  subscriptionStatus: SubscriptionStatusEnum;

  @IsNotEmpty()
  planKey: PlanKeyEnum;

  @IsOptional()
  currentPeriodStart?: Date;

  @IsOptional()
  currentPeriodEnd?: Date;

  @IsOptional()
  daysRemaining?: number;
}

export class MockCheckoutDto {
  @IsEnum(PlanKeyEnum)
  @IsNotEmpty()
  planKey: PlanKeyEnum;
}