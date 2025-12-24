import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
export declare class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void;
    private getUniqueConstraintMessage;
    private getForeignKeyConstraintMessage;
    private getInvalidFieldMessage;
    private getErrorName;
}
