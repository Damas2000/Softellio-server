import { CreateTenantDto } from './create-tenant.dto';
declare const UpdateTenantDto_base: import("@nestjs/common").Type<Partial<Omit<CreateTenantDto, "adminEmail" | "adminPassword" | "adminName">>>;
export declare class UpdateTenantDto extends UpdateTenantDto_base {
}
export {};
