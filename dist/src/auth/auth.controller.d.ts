import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { TenantsService } from '../tenants/tenants.service';
export declare class AuthController {
    private authService;
    private tenantsService;
    private readonly logger;
    constructor(authService: AuthService, tenantsService: TenantsService);
    login(loginDto: LoginDto, request: Request, response: Response): Promise<AuthResponseDto>;
    refresh(user: any): Promise<RefreshResponseDto>;
    logout(user: any, request: Request, response: Response): Promise<{
        message: string;
    }>;
    me(user: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
        tenantId: any;
        isActive: any;
    }>;
    private extractHost;
    private isReservedDomain;
    private isSuperAdminEmail;
    private getClientIp;
}
