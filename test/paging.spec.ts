import { Page, paged } from '../lib/paging';

describe('Page data structure', () => {
    it('should default to page size = 10', () => {
        const page = new Page(undefined, undefined);
        expect(page.size).toBe(10);
    });
    it('should default to offset = 0', () => {
        const page = new Page(20, undefined);
        expect(page.offset).toBe(0);
    });
    it('should correctly assign numeric members', () => {
        const page = new Page(10, 10);
        expect(page.offset).toBe(10);
        expect(page.size).toBe(10);
    });
    it('should parse size and offset as integers', () => {
        const page = new Page(14.1, '11' as any);
        expect(page.offset).toBe(11);
        expect(page.size).toBe(14);
    });
    it('should allow to specify "all" as page size', () => {
        const page = new Page('all');
        expect(page.offset).toBe(0);
        expect(page.size).toBe('all');
    });
    it('should throw an error when the offset is invalid', () => {
        expect(() => new Page(10, 'boo' as any)).toThrowError(RangeError, 'Offset is not a number: boo');
    });
    it('should throw an error when the offset is negative', () => {
        expect(() => new Page(10, -3)).toThrowError(RangeError, 'Offset cannot be negative: -3');
    });
    it('should throw an error when the page size is invalid', () => {
        expect(() => new Page('boo' as any)).toThrowError(RangeError, 'Page size is not a number: boo');
    });
    it('should throw an error when the page size is negative', () => {
        expect(() => new Page(-4)).toThrowError(RangeError, 'Page size cannot be negative: -4');
    });
});

describe('Paging function', () => {
    it('should correctly page empty collection', () => {
        const p = paged([], new Page(10, 0));
        expect(p.data.length).toBe(0);
        expect(p.pagination.next).toBeUndefined();
        expect(p.pagination.prev).toBeUndefined();
    });
    it('should drop the last row from LIMIT size + 1', () => {
        // We're selecting LIMIT (size + 1) OFFSET 0
        const p = paged(['a', 'b', 'c', 'd'], new Page(3, 0));
        // Because of that, we're dropping the last row from the row collection
        expect(p.data.length).toBe(3);
        // But it also indicates that there is extra data available
        expect(p.pagination.next).toBe(3);
        expect(p.pagination.prev).toBeUndefined();
    });
    it('should correctly determine previous and next pagination elements', () => {
        const p = paged(['a', 'b', 'c', 'd'], new Page(3, 4));
        expect(p.data.length).toBe(3);
        expect(p.pagination.next).toBe(7);
        expect(p.pagination.prev).toBe(1);
    });
    it('should return everything if page size includes "all" entries', () => {
        const p = paged(['a', 'b', 'c'], new Page('all'));
        expect(p.data.length).toBe(3);
        expect(p.pagination.next).toBeUndefined();
        expect(p.pagination.prev).toBeUndefined();
    });
    it('should return everything if page size includes "all" entries and include prev entry if the offset was supplied', () => {
        const p = paged(['a', 'b', 'c'], new Page('all', 7));
        expect(p.data.length).toBe(3);
        expect(p.pagination.next).toBeUndefined();
        expect(p.pagination.prev).toBe(0);
    });
});
