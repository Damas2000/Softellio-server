export declare class DomainHealthCheckDto {
    domain: string;
    isReachable: boolean;
    responseTime: number | null;
    statusCode: number | null;
    error: string | null;
    checkedAt: Date;
}
