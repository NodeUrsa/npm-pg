import { Client, Pool, QueryConfig, QueryResult } from 'pg';
/**
 * A class that wraps queries made using a DB client in a transaction
 */
export declare class Transaction {
    private readonly client;
    private isCompleted;
    private constructor();
    /**
     * Queries the database using wrapped client.
     * @param queryConfig Query configuration object
     */
    query(queryConfig: QueryConfig): Promise<QueryResult>;
    /**
     * Commits an open transaction.
     * Automatically calls rollback on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    commit(): Promise<void>;
    /**
     * Rolls back a transaction.
     * Automatically releases the database client on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    rollback(): Promise<void>;
    /**
     * Begins a transaction with a client taken from a pg connection pool
     * @param pool Database connection pool. @see Pool
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    static begin(pool: Pool): Promise<Transaction>;
    /**
     * Begins a transaction by wrapping a database client in a Transaction object
     * @param client PG client. @see Client
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    static wrap(client: Client): Promise<Transaction>;
}
