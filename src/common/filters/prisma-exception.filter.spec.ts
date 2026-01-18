import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
      method: 'POST',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  describe('P2002 - Unique Constraint Violation', () => {
    it('should return 409 status with email conflict message', () => {
      const exception = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'An account with this email address already exists.',
        })
      );
    });

    it('should return 409 status with slug conflict message', () => {
      const exception = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['slug'] },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A resource with this URL slug already exists. Please choose a different one.',
        })
      );
    });

    it('should return generic unique constraint message for unknown fields', () => {
      const exception = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['customField', 'anotherField'] },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A resource with the specified customField, anotherField already exists.',
        })
      );
    });
  });

  describe('P2003 - Foreign Key Constraint Violation', () => {
    it('should return 400 status with page reference error', () => {
      const exception = new PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: { field_name: 'pageId' },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'The specified page does not exist or is not accessible.',
        })
      );
    });

    it('should return 400 status with parent reference error', () => {
      const exception = new PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: { field_name: 'parentId' },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'The specified parent resource does not exist or is not accessible.',
        })
      );
    });

    it('should return generic foreign key error for unknown fields', () => {
      const exception = new PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: { field_name: 'unknownId' },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'The referenced resource does not exist or is not accessible.',
        })
      );
    });
  });

  describe('P2025 - Record Not Found', () => {
    it('should return 404 status with not found message', () => {
      const exception = new PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
          meta: {},
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'The requested resource was not found or has been deleted.',
        })
      );
    });
  });

  describe('P2014 - Invalid Field Value', () => {
    it('should return 400 status with field validation error', () => {
      const exception = new PrismaClientKnownRequestError(
        'Invalid value for field',
        {
          code: 'P2014',
          clientVersion: '5.0.0',
          meta: { target: 'email' },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Invalid value provided for field: email',
        })
      );
    });
  });

  describe('P2034 - Transaction Conflict', () => {
    it('should return 409 status with transaction conflict message', () => {
      const exception = new PrismaClientKnownRequestError(
        'Transaction conflict',
        {
          code: 'P2034',
          clientVersion: '5.0.0',
          meta: {},
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'Data was modified by another process. Please refresh and try again.',
        })
      );
    });
  });

  describe('Unknown Prisma Error Codes', () => {
    it('should return 500 status with generic error message for unknown codes', () => {
      const exception = new PrismaClientKnownRequestError(
        'Unknown prisma error',
        {
          code: 'P9999', // Unknown code
          clientVersion: '5.0.0',
          meta: {},
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'An unexpected database error occurred. Please try again or contact support.',
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should include all required fields in error response', () => {
      const exception = new PrismaClientKnownRequestError(
        'Test error',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        }
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          error: expect.any(String),
          message: expect.any(String),
          timestamp: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/),
          path: '/test',
        })
      );
    });
  });
});