export interface DnsVerificationResult {
    verified: boolean;
    records: string[];
    error?: string;
}
export declare class DnsVerificationUtil {
    private readonly logger;
    private readonly VERIFICATION_PREFIX;
    generateVerificationToken(): string;
    generateDnsInstructions(domain: string, token: string): {
        type: "TXT";
        host: string;
        value: string;
        instructions: string;
    };
    verifyDomainOwnership(domain: string, expectedToken: string): Promise<DnsVerificationResult>;
    checkMxRecords(domain: string): Promise<boolean>;
    checkARecords(domain: string): Promise<boolean>;
    validateDomainFormat(domain: string): boolean;
    private getDnsErrorMessage;
}
