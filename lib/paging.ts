import { SQL, SQLStatement } from 'sql-template-strings';

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
export class Page {
    public readonly size: number | 'all';
    public readonly offset: number;

    /**
     * Creates a new instance of Page, based on the size and offset.
     * @param {number|string} [pageSize=10] Size of the page. 'all' indicates that all entries should be retrieved
     * @param {number} [offset=0] Offset of the collection
     */
    public constructor(pageSize?: number | null | 'all', offset?: number | null) {
        this.offset = Number.parseInt((offset == undefined ? 0 : offset) as any, 10);
        if (Number.isNaN(this.offset)) {
            throw new RangeError('Offset is not a number: ' + offset);
        }
        if (this.offset < 0) {
            throw new RangeError('Offset cannot be negative: ' + offset);
        }

        this.size = pageSize === 'all' ? 'all' : Number.parseInt((pageSize == undefined ? 10 : pageSize) as any, 10);
        if (typeof this.size === 'number') {
            if (Number.isNaN(this.size)) {
                throw new RangeError('Page size is not a number: ' + pageSize);
            }
            if (this.size < 0) {
                throw new RangeError('Page size cannot be negative: ' + pageSize);
            }
        }
    }
}

/**
 * Creates pagination result for a database call.
 * @param {Object[]} rows Collection of rows
 * @param {Page} page Page information
 */
export function paged<T>(rows: T[], page: Page): Paged<T> {
    if (page.size === 'all') {
        return {
            data: rows,
            pagination: {
                prev: page.offset > 0 ? 0 : undefined
            }
        };
    }

    const prev = page.offset > page.size ? page.offset - page.size : 0;
    const next = page.offset + page.size;

    const result = [...rows];
    if (rows.length > page.size) {
        result.pop();
    }
    return {
        data: result,
        pagination: {
            prev: prev === 0 && page.offset === 0 ? undefined : prev,
            next: rows.length < (page.size + 1) ? undefined : next
        }
    };
}

/**
 * Appends 'OFFSET ? LIMIT ?' to the SQL statement.
 * The SQL statement already has to be properly ordered.
 * @param statement Source SQL statement
 * @param page Page data
 */
export function pagedSql(statement: SQLStatement, page: Page): SQLStatement {
    return page.size === 'all'
        ? statement.append(SQL` LIMIT ALL OFFSET ${page.offset}`)
        : statement.append(SQL` LIMIT ${page.size + 1} OFFSET ${page.offset}`);
}
