import { Request, Response } from 'express';
import { DomainResolverService } from '../common/services/domain-resolver.service';
export declare class FrontendController {
    private domainResolver;
    constructor(domainResolver: DomainResolverService);
    serveFrontend(req: Request, res: Response): Promise<void>;
    private extractCompanyInfo;
    private renderCompanyPage;
    private renderAdminPage;
    private renderDefaultPage;
    private renderErrorPage;
}
