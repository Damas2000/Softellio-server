import { DomainType, DomainSSLStatus } from '@prisma/client';
export declare class DnsInstructionsDto {
    type: 'TXT' | 'CNAME';
    host: string;
    value: string;
    instructions: string;
}
export declare class DomainWithInstructionsDto {
    id: number;
    domain: string;
    type: DomainType;
    isPrimary: boolean;
    isActive: boolean;
    isVerified: boolean;
    sslStatus: DomainSSLStatus;
    verifiedAt: Date | null;
    dnsInstructions: DnsInstructionsDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VerifyDomainResponseDto {
    status: 'verified' | 'pending' | 'failed';
    message: string;
    checkedRecords: string[];
    verifiedAt?: Date;
}
