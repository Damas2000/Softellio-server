import { DomainType } from '@prisma/client';
export declare class CreateDomainDto {
    domain: string;
    type: DomainType;
    isPrimary?: boolean;
}
