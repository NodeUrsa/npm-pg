import { SQLStatement } from 'sql-template-strings';
export interface Pagination {
    prev?: number;
    next?: number;
}
export interface Paged<T> {
    data: T[];
    pagination: Pagination;
}
/**
 * Represents page information
 */
export declare class Page {
    readonly size: number | 'all';
    readonly offset: number;
    /**
     * Creates a new instance of Page, based on the size and offset.
     * @param {number|string} [pageSize=10] Size of the page. 'all' indicates that all entries should be retrieved
     * @param {number} [offset=0] Offset of the collection
     */
    constructor(pageSize?: number | null | 'all', offset?: number | null);
}
/**
 * Creates pagination result for a database call.
 * @param {Object[]} rows Collection of rows
 * @param {Page} page Page information
 */
export declare function paged<T>(rows: T[], page: Page): Paged<T>;
/**
 * Appends 'OFFSET ? LIMIT ?' to the SQL statement.
 * The SQL statement already has to be properly ordered.
 * @param statement Source SQL statement
 * @param page Page data
 */
export declare function pagedSql(statement: SQLStatement, page: Page): SQLStatement;
