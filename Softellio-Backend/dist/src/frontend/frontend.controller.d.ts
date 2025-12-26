import { Request, Response, NextFunction } from 'express';
import { DomainResolverService } from '../common/services/domain-resolver.service';
export declare class FrontendController {
    private domainResolver;
    constructor(domainResolver: DomainResolverService);
    serveFrontend(req: Request, res: Response, next: NextFunction): Promise<void>;
    private extractCompanyInfo;
    private isPortalDomain;
    private renderCompanyPage;
    private renderAdminPage;
    private renderDefaultPage;
    private renderErrorPage;
}
