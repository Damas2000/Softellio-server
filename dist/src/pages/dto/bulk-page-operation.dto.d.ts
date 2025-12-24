import { PageStatus } from './create-page.dto';
export declare class BulkPageDeleteDto {
    ids: number[];
}
export declare class BulkPageStatusUpdateDto {
    ids: number[];
    status: PageStatus;
}
export declare class BulkPageOperationDto {
    ids: number[];
    operation: 'delete' | 'publish' | 'draft' | 'archive';
    newStatus?: PageStatus;
}
export declare class BulkOperationResultDto {
    processed: number;
    failed: number;
    successIds: number[];
    failedIds?: Array<{
        id: number;
        error: string;
    }>;
    operation: string;
    message: string;
}
