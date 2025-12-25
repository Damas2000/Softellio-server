import { DomainType } from '@prisma/client';
export declare class CreateDomainDto {
    domain: string;
    isPrimary?: boolean;
    type?: DomainType;
}
