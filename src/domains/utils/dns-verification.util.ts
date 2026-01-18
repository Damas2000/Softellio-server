import { promises as dns } from 'dns';
import { Injectable, Logger } from '@nestjs/common';

export interface DnsVerificationResult {
  verified: boolean;
  records: string[];
  error?: string;
}

@Injectable()
export class DnsVerificationUtil {
  private readonly logger = new Logger(DnsVerificationUtil.name);
  private readonly VERIFICATION_PREFIX = 'softellio-verify=';

  /**
   * Generate a verification token for domain verification
   */
  generateVerificationToken(): string {
    // Generate a random token (32 characters)
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36)[2] || '0'
    ).join('');
  }

  /**
   * Generate DNS instructions for domain verification
   */
  generateDnsInstructions(domain: string, token: string) {
    return {
      type: 'TXT' as const,
      host: '@',
      value: `${this.VERIFICATION_PREFIX}${token}`,
      instructions: `Add this TXT record to your DNS settings at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare). It may take up to 48 hours for DNS changes to propagate.`
    };
  }

  /**
   * Verify domain ownership by checking TXT records
   */
  async verifyDomainOwnership(domain: string, expectedToken: string): Promise<DnsVerificationResult> {
    try {
      this.logger.log(`Verifying domain ownership for ${domain} with token: ${expectedToken}`);

      // Look up TXT records for the domain
      const txtRecords = await dns.resolveTxt(domain);

      // Flatten TXT records (they come as arrays of arrays)
      const allRecords = txtRecords.flat();

      this.logger.log(`Found TXT records for ${domain}:`, allRecords);

      // Look for our verification record
      const expectedRecord = `${this.VERIFICATION_PREFIX}${expectedToken}`;
      const verificationRecord = allRecords.find(record =>
        record === expectedRecord
      );

      if (verificationRecord) {
        this.logger.log(`Domain ${domain} successfully verified with token ${expectedToken}`);
        return {
          verified: true,
          records: allRecords
        };
      } else {
        this.logger.warn(`Domain ${domain} verification failed. Expected: ${expectedRecord}, Found: ${allRecords.join(', ')}`);
        return {
          verified: false,
          records: allRecords,
          error: `Verification record not found. Expected: ${expectedRecord}`
        };
      }

    } catch (error) {
      this.logger.error(`DNS lookup failed for domain ${domain}:`, error);

      // Check for common DNS errors
      const errorMessage = this.getDnsErrorMessage(error);

      return {
        verified: false,
        records: [],
        error: errorMessage
      };
    }
  }

  /**
   * Check if domain has valid MX records (optional validation)
   */
  async checkMxRecords(domain: string): Promise<boolean> {
    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if domain resolves to valid A records
   */
  async checkARecords(domain: string): Promise<boolean> {
    try {
      const aRecords = await dns.resolve4(domain);
      return aRecords.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate domain format
   */
  validateDomainFormat(domain: string): boolean {
    // Basic domain validation regex
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;

    // Check format
    if (!domainRegex.test(domain)) {
      return false;
    }

    // Check for reserved domains
    const reservedDomains = [
      'softellio.com',
      'api.softellio.com',
      'portal.softellio.com',
      'admin.softellio.com',
      'www.softellio.com'
    ];

    // Check for softellio.com subdomains (should use system type instead)
    if (domain.endsWith('.softellio.com')) {
      return false;
    }

    // Check for reserved domains
    if (reservedDomains.includes(domain.toLowerCase())) {
      return false;
    }

    return true;
  }

  /**
   * Get user-friendly error message for DNS errors
   */
  private getDnsErrorMessage(error: any): string {
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
}