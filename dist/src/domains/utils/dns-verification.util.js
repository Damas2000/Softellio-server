"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DnsVerificationUtil_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsVerificationUtil = void 0;
const dns_1 = require("dns");
const common_1 = require("@nestjs/common");
let DnsVerificationUtil = DnsVerificationUtil_1 = class DnsVerificationUtil {
    constructor() {
        this.logger = new common_1.Logger(DnsVerificationUtil_1.name);
        this.VERIFICATION_PREFIX = 'softellio-verify=';
    }
    generateVerificationToken() {
        return Array.from({ length: 32 }, () => Math.random().toString(36)[2] || '0').join('');
    }
    generateDnsInstructions(domain, token) {
        return {
            type: 'TXT',
            host: '@',
            value: `${this.VERIFICATION_PREFIX}${token}`,
            instructions: `Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare). It may take up to 48 hours for DNS changes to propagate.`
        };
    }
    async verifyDomainOwnership(domain, expectedToken) {
        try {
            this.logger.log(`Verifying domain ownership for ${domain} with token: ${expectedToken}`);
            const txtRecords = await dns_1.promises.resolveTxt(domain);
            const allRecords = txtRecords.flat();
            this.logger.log(`Found TXT records for ${domain}:`, allRecords);
            const expectedRecord = `${this.VERIFICATION_PREFIX}${expectedToken}`;
            const verificationRecord = allRecords.find(record => record === expectedRecord);
            if (verificationRecord) {
                this.logger.log(`Domain ${domain} successfully verified with token ${expectedToken}`);
                return {
                    verified: true,
                    records: allRecords
                };
            }
            else {
                this.logger.warn(`Domain ${domain} verification failed. Expected: ${expectedRecord}, Found: ${allRecords.join(', ')}`);
                return {
                    verified: false,
                    records: allRecords,
                    error: `Verification record not found. Expected: ${expectedRecord}`
                };
            }
        }
        catch (error) {
            this.logger.error(`DNS lookup failed for domain ${domain}:`, error);
            const errorMessage = this.getDnsErrorMessage(error);
            return {
                verified: false,
                records: [],
                error: errorMessage
            };
        }
    }
    async checkMxRecords(domain) {
        try {
            const mxRecords = await dns_1.promises.resolveMx(domain);
            return mxRecords.length > 0;
        }
        catch {
            return false;
        }
    }
    async checkARecords(domain) {
        try {
            const aRecords = await dns_1.promises.resolve4(domain);
            return aRecords.length > 0;
        }
        catch {
            return false;
        }
    }
    validateDomainFormat(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return false;
        }
        const reservedDomains = [
            'softellio.com',
            'api.softellio.com',
            'portal.softellio.com',
            'admin.softellio.com',
            'www.softellio.com'
        ];
        if (domain.endsWith('.softellio.com')) {
            return false;
        }
        if (reservedDomains.includes(domain.toLowerCase())) {
            return false;
        }
        return true;
    }
    getDnsErrorMessage(error) {
        if (!error || typeof error !== 'object') {
            return 'DNS lookup failed for unknown reason';
        }
        switch (error.code) {
            case 'ENOTFOUND':
                return 'Domain not found. Please check if the domain is correctly registered and DNS is configured.';
            case 'ENODATA':
                return 'No TXT records found for this domain. Please add the verification TXT record to your DNS settings.';
            case 'ETIMEOUT':
                return 'DNS lookup timed out. Please try again later or check your internet connection.';
            case 'ESERVFAIL':
                return 'DNS server failure. Please try again later.';
            case 'EREFUSED':
                return 'DNS server refused the request. Please try again later.';
            default:
                return `DNS lookup failed: ${error.message || 'Unknown error'}`;
        }
    }
};
exports.DnsVerificationUtil = DnsVerificationUtil;
exports.DnsVerificationUtil = DnsVerificationUtil = DnsVerificationUtil_1 = __decorate([
    (0, common_1.Injectable)()
], DnsVerificationUtil);
//# sourceMappingURL=dns-verification.util.js.map