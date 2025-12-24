import { DnsVerificationUtil } from './dns-verification.util';
import { promises as dns } from 'dns';

// Mock the dns module
jest.mock('dns', () => ({
  promises: {
    resolveTxt: jest.fn(),
    resolveMx: jest.fn(),
    resolve4: jest.fn(),
  },
}));

const mockDns = dns as jest.Mocked<typeof dns>;

describe('DnsVerificationUtil', () => {
  let service: DnsVerificationUtil;

  beforeEach(() => {
    service = new DnsVerificationUtil();
    jest.clearAllMocks();
  });

  describe('generateVerificationToken', () => {
    it('should generate a 32-character token', () => {
      const token = service.generateVerificationToken();
      expect(token).toHaveLength(32);
      expect(typeof token).toBe('string');
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateVerificationToken();
      const token2 = service.generateVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateDnsInstructions', () => {
    it('should generate correct DNS instructions', () => {
      const domain = 'example.com';
      const token = 'abc123def456';

      const instructions = service.generateDnsInstructions(domain, token);

      expect(instructions).toEqual({
        type: 'TXT',
        host: '@',
        value: 'softellio-verify=abc123def456',
        instructions: expect.stringContaining('Add this TXT record to your DNS settings')
      });
    });
  });

  describe('verifyDomainOwnership', () => {
    const domain = 'example.com';
    const token = 'abc123def456';

    it('should verify domain successfully when TXT record is found', async () => {
      const txtRecords = [['softellio-verify=abc123def456'], ['some-other-record']];
      mockDns.resolveTxt.mockResolvedValue(txtRecords);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(mockDns.resolveTxt).toHaveBeenCalledWith(domain);
      expect(result).toEqual({
        verified: true,
        records: ['softellio-verify=abc123def456', 'some-other-record']
      });
    });

    it('should fail verification when TXT record is not found', async () => {
      const txtRecords = [['some-other-record'], ['another-record']];
      mockDns.resolveTxt.mockResolvedValue(txtRecords);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(result).toEqual({
        verified: false,
        records: ['some-other-record', 'another-record'],
        error: 'Verification record not found. Expected: softellio-verify=abc123def456'
      });
    });

    it('should handle ENOTFOUND DNS error', async () => {
      const dnsError = new Error('Domain not found') as any;
      dnsError.code = 'ENOTFOUND';
      mockDns.resolveTxt.mockRejectedValue(dnsError);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(result).toEqual({
        verified: false,
        records: [],
        error: 'Domain not found. Please check if the domain is correctly registered and DNS is configured.'
      });
    });

    it('should handle ENODATA DNS error', async () => {
      const dnsError = new Error('No data') as any;
      dnsError.code = 'ENODATA';
      mockDns.resolveTxt.mockRejectedValue(dnsError);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(result).toEqual({
        verified: false,
        records: [],
        error: 'No TXT records found for this domain. Please add the verification TXT record to your DNS settings.'
      });
    });

    it('should handle ETIMEOUT DNS error', async () => {
      const dnsError = new Error('Timeout') as any;
      dnsError.code = 'ETIMEOUT';
      mockDns.resolveTxt.mockRejectedValue(dnsError);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(result).toEqual({
        verified: false,
        records: [],
        error: 'DNS lookup timed out. Please try again later or check your internet connection.'
      });
    });

    it('should handle unknown DNS errors', async () => {
      const dnsError = new Error('Unknown error') as any;
      dnsError.code = 'UNKNOWN';
      mockDns.resolveTxt.mockRejectedValue(dnsError);

      const result = await service.verifyDomainOwnership(domain, token);

      expect(result).toEqual({
        verified: false,
        records: [],
        error: 'DNS lookup failed: Unknown error'
      });
    });
  });

  describe('checkMxRecords', () => {
    it('should return true when MX records exist', async () => {
      mockDns.resolveMx.mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]);

      const result = await service.checkMxRecords('example.com');

      expect(result).toBe(true);
      expect(mockDns.resolveMx).toHaveBeenCalledWith('example.com');
    });

    it('should return false when MX records do not exist', async () => {
      mockDns.resolveMx.mockResolvedValue([]);

      const result = await service.checkMxRecords('example.com');

      expect(result).toBe(false);
    });

    it('should return false on DNS error', async () => {
      mockDns.resolveMx.mockRejectedValue(new Error('DNS error'));

      const result = await service.checkMxRecords('example.com');

      expect(result).toBe(false);
    });
  });

  describe('checkARecords', () => {
    it('should return true when A records exist', async () => {
      mockDns.resolve4.mockResolvedValue(['192.168.1.1']);

      const result = await service.checkARecords('example.com');

      expect(result).toBe(true);
      expect(mockDns.resolve4).toHaveBeenCalledWith('example.com');
    });

    it('should return false when A records do not exist', async () => {
      mockDns.resolve4.mockResolvedValue([]);

      const result = await service.checkARecords('example.com');

      expect(result).toBe(false);
    });

    it('should return false on DNS error', async () => {
      mockDns.resolve4.mockRejectedValue(new Error('DNS error'));

      const result = await service.checkARecords('example.com');

      expect(result).toBe(false);
    });
  });

  describe('validateDomainFormat', () => {
    it('should validate correct domain formats', () => {
      const validDomains = [
        'example.com',
        'subdomain.example.com',
        'test-domain.co.uk',
        'domain123.org',
        'my-site.app'
      ];

      validDomains.forEach(domain => {
        expect(service.validateDomainFormat(domain)).toBe(true);
      });
    });

    it('should reject invalid domain formats', () => {
      const invalidDomains = [
        'invalid',
        'invalid.',
        '.invalid',
        'inv@lid.com',
        'invalid..com',
        'invalid-.com',
        '-invalid.com',
        'invalid.c',
        'invalid space.com'
      ];

      invalidDomains.forEach(domain => {
        expect(service.validateDomainFormat(domain)).toBe(false);
      });
    });

    it('should reject softellio.com subdomains', () => {
      const softellioSubdomains = [
        'test.softellio.com',
        'api.softellio.com',
        'portal.softellio.com'
      ];

      softellioSubdomains.forEach(domain => {
        expect(service.validateDomainFormat(domain)).toBe(false);
      });
    });

    it('should reject reserved domains', () => {
      const reservedDomains = [
        'softellio.com',
        'api.softellio.com',
        'portal.softellio.com',
        'admin.softellio.com',
        'www.softellio.com'
      ];

      reservedDomains.forEach(domain => {
        expect(service.validateDomainFormat(domain)).toBe(false);
      });
    });

    it('should handle case insensitive reserved domains', () => {
      const reservedDomains = [
        'SOFTELLIO.COM',
        'API.SOFTELLIO.COM',
        'Portal.Softellio.Com'
      ];

      reservedDomains.forEach(domain => {
        expect(service.validateDomainFormat(domain)).toBe(false);
      });
    });
  });
});