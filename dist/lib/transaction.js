"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const selvera_aggregate_error_1 = require("selvera-aggregate-error");
/**
 * A class that wraps queries made using a DB client in a transaction
 */
class Transaction {
    constructor(client) {
        this.client = client;
        this.isCompleted = false;
    }
    /**
     * Queries the database using wrapped client
     * @param {string | QueryConfig} queryTextOrConfig Query text or query configuration object.
     * @param {any[]} values Placeholder values. Used only if queryTextOrConfig is a string.
     */
    query(queryTextOrConfig, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof queryTextOrConfig === 'string') {
                return this.client.query(queryTextOrConfig, values === undefined ? [] : values);
            }
            return this.client.query(queryTextOrConfig);
        });
    }
    /**
     * Commits an open transaction.
     * Automatically calls rollback on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isCompleted) {
                return;
            }
            try {
                yield this.client.query('COMMIT');
                this.client.release();
            }
            catch (error) {
                try {
                    yield this.rollback();
                }
                catch (rollbackError) {
                    throw new selvera_aggregate_error_1.AggregateError(rollbackError, error);
                }
                throw error;
            }
            finally {
                this.isCompleted = true;
            }
        });
    }
    /**
     * Rolls back a transaction.
     * Automatically releases the database client on failure.
     * @throws {AggregateError} Throws an aggregate error when more than one failure happens during a call.
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isCompleted) {
                return;
            }
            try {
                yield this.client.query('ROLLBACK');
                this.client.release();
            }
            catch (error) {
                try {
                    this.client.release(error);
                }
                catch (releaseError) {
                    throw new selvera_aggregate_error_1.AggregateError(releaseError, error);
                }
                throw error;
            }
            finally {
                this.isCompleted = true;
            }
        });
    }
    /**
     * Begins a transaction with a client taken from a pg connection pool
     * @param pool Database connection pool. @see Pool
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    static begin(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            return Transaction.wrap(client);
        });
    }
    /**
     * Begins a transaction by wrapping a database client in a Transaction object
     * @param client PG client. @see Client
     * @throws {PgError} Rethrows any PG-related errors that come from the pg client.
     */
    static wrap(client) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.query('BEGIN');
            return new Transaction(client);
        });
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiQzovUHJvamVjdHMvQ29hY2hDYXJlL3ZhZ3JhbnQtbG9jYWwvcGFja2FnZXMvbnBtLXBnL2xpYi8iLCJzb3VyY2VzIjpbImxpYi90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0EscUVBQXlEO0FBRXpEOztHQUVHO0FBQ0g7SUFFSSxZQUFxQyxNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUQzQyxnQkFBVyxHQUFHLEtBQUssQ0FBQztJQUMyQixDQUFDO0lBUXhEOzs7O09BSUc7SUFDVSxLQUFLLENBQUMsaUJBQXVDLEVBQUUsTUFBYzs7WUFDdEUsRUFBRSxDQUFDLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRixDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUFBO0lBRUQ7Ozs7O09BS0c7SUFDVSxNQUFNOztZQUNmLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUM7WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDO29CQUNELE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMxQixDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLE1BQU0sSUFBSSx3Q0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFDRCxNQUFNLEtBQUssQ0FBQztZQUNoQixDQUFDO29CQUFTLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDNUIsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ1UsUUFBUTs7WUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLENBQUM7b0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDcEIsTUFBTSxJQUFJLHdDQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUNELE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUM7b0JBQVMsQ0FBQztnQkFDUCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBTyxLQUFLLENBQUMsSUFBVTs7WUFDaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBTyxJQUFJLENBQUMsTUFBYzs7WUFDbkMsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQUE7Q0FDSjtBQTlGRCxrQ0E4RkMifQ==