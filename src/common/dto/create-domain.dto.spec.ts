import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDomainDto } from './create-domain.dto';

describe('CreateDomainDto', () => {
  describe('domain validation', () => {
    it('should accept valid domain', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should accept domain with www subdomain', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'www.hamza.com',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('www.hamza.com');
    });

    it('should normalize domain by removing protocol', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'https://hamza.com',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should normalize domain by removing path', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com/path',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should normalize domain by removing port', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com:8080',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should normalize domain by converting to lowercase', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'HAMZA.COM',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should normalize domain by trimming whitespace', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: '  hamza.com  ',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should normalize domain by removing trailing dots', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com.',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.domain).toBe('hamza.com');
    });

    it('should reject empty domain', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: '',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject domain without TLD', async () => {
      expect(() => {
        plainToClass(CreateDomainDto, {
          domain: 'hamza',
          isPrimary: false,
          type: 'custom',
        });
      }).toThrow(/Invalid domain format/);
    });

    it('should reject reserved softellio.com subdomain', async () => {
      expect(() => {
        plainToClass(CreateDomainDto, {
          domain: 'demo.softellio.com',
          isPrimary: false,
          type: 'custom',
        });
      }).toThrow(/reserved and cannot be used/);
    });

    it('should reject platform reserved domain', async () => {
      expect(() => {
        plainToClass(CreateDomainDto, {
          domain: 'platform.softellio.com',
          isPrimary: false,
          type: 'custom',
        });
      }).toThrow(/reserved and cannot be used/);
    });

    it('should reject domain with invalid characters', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'invalid_domain.com',
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should reject domain exceeding max length', async () => {
      const longDomain = 'a'.repeat(250) + '.com'; // 254 characters, exceeds 253 limit

      const dto = plainToClass(CreateDomainDto, {
        domain: longDomain,
        isPrimary: false,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('isPrimary validation', () => {
    it('should accept boolean isPrimary', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: true,
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.isPrimary).toBe(true);
    });

    it('should default isPrimary to false when not provided', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.isPrimary).toBe(false);
    });

    it('should reject non-boolean isPrimary', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: 'true', // string instead of boolean
        type: 'custom',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('type validation', () => {
    it('should accept valid type values', async () => {
      const customDto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: false,
        type: 'custom',
      });

      const subdomainDto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: false,
        type: 'subdomain',
      });

      const customErrors = await validate(customDto);
      const subdomainErrors = await validate(subdomainDto);

      expect(customErrors).toHaveLength(0);
      expect(subdomainErrors).toHaveLength(0);
      expect(customDto.type).toBe('custom');
      expect(subdomainDto.type).toBe('subdomain');
    });

    it('should default type to custom when not provided', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.type).toBe('custom');
    });

    it('should reject invalid type value', async () => {
      const dto = plainToClass(CreateDomainDto, {
        domain: 'hamza.com',
        isPrimary: false,
        type: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });
  });
});