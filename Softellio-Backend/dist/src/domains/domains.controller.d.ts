import { DomainsService } from './domains.service';
import { CreateDomainDto, UpdateDomainDto, DomainWithInstructionsDto, VerifyDomainResponseDto } from './dto';
export declare class DomainsController {
    private readonly domainsService;
    constructor(domainsService: DomainsService);
    create(tenantId: number, createDomainDto: CreateDomainDto): Promise<DomainWithInstructionsDto>;
    findAll(tenantId: number): Promise<DomainWithInstructionsDto[]>;
    findOne(tenantId: number, id: number): Promise<DomainWithInstructionsDto>;
    update(tenantId: number, id: number, updateDomainDto: UpdateDomainDto): Promise<DomainWithInstructionsDto>;
    verify(tenantId: number, id: number): Promise<VerifyDomainResponseDto>;
    remove(tenantId: number, id: number): Promise<{
        message: string;
    }>;
}
