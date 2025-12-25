import { PrismaService } from '../config/prisma.service';
import { DnsVerificationUtil } from './utils/dns-verification.util';
import { CreateDomainDto, UpdateDomainDto, DomainWithInstructionsDto, VerifyDomainResponseDto } from './dto';
export declare class DomainsService {
    private readonly prisma;
    private readonly dnsVerification;
    private readonly logger;
    constructor(prisma: PrismaService, dnsVerification: DnsVerificationUtil);
    create(tenantId: number, createDomainDto: CreateDomainDto): Promise<DomainWithInstructionsDto>;
    findAllByTenant(tenantId: number): Promise<DomainWithInstructionsDto[]>;
    findOne(tenantId: number, domainId: number): Promise<DomainWithInstructionsDto>;
    update(tenantId: number, domainId: number, updateDomainDto: UpdateDomainDto): Promise<DomainWithInstructionsDto>;
    verify(tenantId: number, domainId: number): Promise<VerifyDomainResponseDto>;
    remove(tenantId: number, domainId: number): Promise<{
        message: string;
    }>;
    private ensureSinglePrimaryDomain;
    private generateDnsInstructions;
    private formatDomainResponse;
}
