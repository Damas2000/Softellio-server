import { PageStatus } from './create-page.dto';
export declare class PageQueryDto {
    status?: PageStatus;
    language?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status';
    sortOrder?: 'asc' | 'desc';
    createdAfter?: string;
    createdBefore?: string;
}
