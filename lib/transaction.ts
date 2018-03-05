import { Client, Pool, QueryConfig, QueryResult } from 'pg';
import { AggregateError } from 'selvera-aggregate-error';

/**
 * A class that wraps queries made using a DB client in a transaction
 */
export class Transaction {
    private isCompleted = false;
    private constructor(private readonly client: Client) { }

    /**
     * Queries the database using wrapped client.
     * @param queryConfig Query configuration object
     */
    public query(queryConfig: QueryConfig): Promise<QueryResult>;

    /**
     * Queries the database using wrapped client
     * @param {string | QueryConfig} queryTextOrConfig Query text or query configuration object.
     * @param {any[]} values Placeholder values. Used only if queryTextOrConfig is a string.
     */
    public async query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult> {
        if (typeof queryTextOrConfig === 'string') {
            return this.client.query(queryTextOrConfig, values === undefined ? [] : values);
        }

        return this.client.query(queryTextOrConfig);
    }

    /**
     * Commits an open transaction.
     * Automatically calls rollback on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    public async commit(): Promise<void> {
        if (this.isCompleted) {
            return;
        }

        try {
            await this.client.query('COMMIT');
            this.client.release();
        } catch (error) {
            try {
                await this.rollback();
            } catch (rollbackError) {
                throw new AggregateError(rollbackError, error);
            }
            throw error;
        } finally {
            this.isCompleted = true;
        }
    }

    /**
     * Rolls back a transaction.
     * Automatically releases the database client on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    public async rollback(): Promise<void> {
        if (this.isCompleted) {
            return;
        }

        try {
            await this.client.query('ROLLBACK');
            this.client.release();
        } catch (error) {
            try {
                this.client.release(error);
            } catch (releaseError) {
                throw new AggregateError(releaseError, error);
            }
            throw error;
        } finally {
            this.isCompleted = true;
        }
    }

    /**
     * Begins a transaction with a client taken from a pg connection pool
     * @param pool Database connection pool. @see Pool
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    public static async begin(pool: Pool): Promise<Transaction> {
        const client = await pool.connect();
        return Transaction.wrap(client);
    }

    /**
     * Begins a transaction by wrapping a database client in a Transaction object
     * @param client PG client. @see Client
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    public static async wrap(client: Client): Promise<Transaction> {
        await client.query('BEGIN');
        return new Transaction(client);
    }
}
