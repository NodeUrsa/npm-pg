"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_template_strings_1 = require("sql-template-strings");
/**
 * Represents page information
 */
class Page {
    /**
     * Creates a new instance of Page, based on the size and offset.
     * @param {number|string} [pageSize=10] Size of the page. 'all' indicates that all entries should be retrieved
     * @param {number} [offset=0] Offset of the collection
     */
    constructor(pageSize, offset) {
        this.offset = Number.parseInt((offset == undefined ? 0 : offset), 10);
        if (Number.isNaN(this.offset)) {
            throw new RangeError('Offset is not a number: ' + offset);
        }
        if (this.offset < 0) {
            throw new RangeError('Offset cannot be negative: ' + offset);
        }
        this.size = pageSize === 'all' ? 'all' : Number.parseInt((pageSize == undefined ? 10 : pageSize), 10);
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
exports.Page = Page;
/**
 * Creates pagination result for a database call.
 * @param {Object[]} rows Collection of rows
 * @param {Page} page Page information
 */
function paged(rows, page) {
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
exports.paged = paged;
/**
 * Appends 'OFFSET ? LIMIT ?' to the SQL statement.
 * The SQL statement already has to be properly ordered.
 * @param statement Source SQL statement
 * @param page Page data
 */
function pagedSql(statement, page) {
    return page.size === 'all'
        ? statement.append(sql_template_strings_1.SQL ` LIMIT ALL OFFSET ${page.offset}`)
        : statement.append(sql_template_strings_1.SQL ` LIMIT ${page.size + 1} OFFSET ${page.offset}`);
}
exports.pagedSql = pagedSql;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6IkM6L1Byb2plY3RzL0NvYWNoQ2FyZS92YWdyYW50LWxvY2FsL3BhY2thZ2VzL25wbS1wZy9saWIvIiwic291cmNlcyI6WyJsaWIvcGFnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQXlEO0FBWXpEOztHQUVHO0FBQ0g7SUFJSTs7OztPQUlHO0lBQ0gsWUFBbUIsUUFBZ0MsRUFBRSxNQUFzQjtRQUN2RSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLElBQUksVUFBVSxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxJQUFJLFVBQVUsQ0FBQyw2QkFBNkIsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxJQUFJLFVBQVUsQ0FBQyw2QkFBNkIsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixNQUFNLElBQUksVUFBVSxDQUFDLGdDQUFnQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ3RFLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBNUJELG9CQTRCQztBQUVEOzs7O0dBSUc7QUFDSCxlQUF5QixJQUFTLEVBQUUsSUFBVTtJQUMxQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDO1lBQ0gsSUFBSSxFQUFFLElBQUk7WUFDVixVQUFVLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDeEM7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBRXJDLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ0QsTUFBTSxDQUFDO1FBQ0gsSUFBSSxFQUFFLE1BQU07UUFDWixVQUFVLEVBQUU7WUFDUixJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3hELElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJO1NBQ3pEO0tBQ0osQ0FBQztBQUNOLENBQUM7QUF4QkQsc0JBd0JDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxrQkFBeUIsU0FBdUIsRUFBRSxJQUFVO0lBQ3hELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUs7UUFDdEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsMEJBQUcsQ0FBQSxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pELENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLDBCQUFHLENBQUEsVUFBVSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBSkQsNEJBSUMifQ==