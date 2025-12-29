import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TenantsService } from '../tenants/tenants.service';
export declare class AuthController {
    private authService;
    private tenantsService;
    private readonly logger;
    constructor(authService: AuthService, tenantsService: TenantsService);
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        user: any;
    }>;
    me(request: Request): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            tenantId: any;
        };
    }>;
    logout(request: Request, response: Response): Promise<{
        ok: boolean;
    }>;
    private extractHost;
    private isReservedDomain;
    private isSuperAdminEmail;
    private getClientIp;
    private extractTokenFromCookie;
}
