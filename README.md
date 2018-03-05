# npm-pg

Custom Postgresql module

Wrapper for node PostgreSQL module (https://github.com/brianc/node-postgres) with some helper functions.

## Building & publishing

Building the library is a simple affair:

    npm run ts

this command should run Typescript compiler (`tsc`) as well as TS linter (`tslint`) with settings predefined in `tsconfig.json` and `tslint.json`, respectively.

Publishing is equally simple. Since we're using GitHub as a reference source for our packages, at least for now, all we have to do is bump the version in `package.json` and tag the sources, all of which can be done with one command:

    npm version

For reference, see `npm version --help`

## API

### Transaction

A class that wraps transaction management for ease of use.

Two static, factory methods are provided:

- `Transaction.begin(Pool)`: begins a new transaction, using a connection from the connection pool. This should be the preferred way to begin a transaction.
- `Transaction.wrap(Client)`: wraps an existing DB client in a transaction. Used internally by `Transaction.begin(Pool)`, generally shouldn't be used explicitly unless we're working with 'naked' database clients instead of connection pools.

Instance methods:

- `query(QueryConfig)`: queries a database using QueryConfig object to pass query name, text and parameters. Delegates to `client.query`.
- `query(string, any[])`: queries a database using provided SQL query text and placeholder values. Delegates to `client.query`.
- `commit()`: commits a transaction, automatically rolls back transaction on failure.
- `rollback()`: performs a transaction rollback, automatically releases the DB client on failure.

Both methods are one-time use only, i.e. calling `commit(); commit();` will only commit the transaction once. Once commited or rolled back, the transaction is marked as 'completed' and calling those methods afterwards won't have any effect, but is safe to do.

The `query` methods are delegated to the wrapped client to avoid a situation where calling `db.query` executes a query on a different connection that's currently wrapped in a transaction.

#### Examples

General usage:

```typescript
import { Pool } from 'pg';
import { Transaction } from 'selvera-pg';

const db = new Pool();
const transaction = await Transaction.begin(db);
try {
    await transaction.query('INSERT INTO t(v1,v2) VALUES($1, $2)', [1,2]); // runs in the transaction
    await db.query('SELECT NOW()'); // is NOT guaranteed to run in a transaction at all
    await transaction.commit();
} catch(error) {
    await transaction.rollback();
}
```

Repeated calls:

```typescript
const transaction = await Transaction.begin(db);
await transaction.rollback(); // actually rolls back the transaction
await transaction.rollback(); // does nothing
await transaction.commit(); // does nothing
await transaction.commit(); // does nothing
```


### Paging

There is one utility paging function available:

- `paged(rows: any[], pageSize: number, offset: number | null | undefined)`

It determines whether there is a 'next' page, a 'previous' page, and returns appropriate data structure along with rows adjusted for a dangling row.
