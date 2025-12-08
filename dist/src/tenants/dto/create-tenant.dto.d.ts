export declare class CreateTenantDto {
    name: string;
    domain: string;
    defaultLanguage?: string;
    availableLanguages?: string[];
    theme?: string;
    primaryColor?: string;
    adminEmail: string;
    adminPassword: string;
    adminName?: string;
}
