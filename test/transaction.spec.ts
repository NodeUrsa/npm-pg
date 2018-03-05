import { AggregateError } from 'selvera-aggregate-error';
import { Transaction } from '../lib/transaction';

describe('Transaction wrapper', () => {
    const client: any = {
        query() {
            return Promise.resolve();
        },
        release() {
            // Nothing happens here actually
         }
    };

    it('should begin transaction when wrapping the client', async (done) => {
        spyOn(client, 'query').and.callThrough();

        await Transaction.wrap(client);
        expect(client.query).toHaveBeenCalledWith('BEGIN');
        done();
    });

    it('should grab client from the pool when starting the transaction', async (done) => {
        spyOn(client, 'query').and.callThrough();

        const pool: any = {
            connect() {
                return Promise.resolve(client);
            }
        };
        spyOn(pool, 'connect').and.callThrough();
        await Transaction.begin(pool);
        expect(pool.connect).toHaveBeenCalled();
        done();
    });

    it('should commit the transaction to the client', async (done) => {
        spyOn(client, 'query').and.callThrough();

        const transaction = await Transaction.wrap(client);
        transaction.commit();
        expect(client.query).toHaveBeenCalledWith('COMMIT');
        done();
    });

    it('should rollback the transaction', async (done) => {
        spyOn(client, 'query').and.callThrough();

        const transaction = await Transaction.wrap(client);
        transaction.rollback();
        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        done();
    });

    it('should commit the transaction only once', async (done) => {
        const spy = spyOn(client, 'query').and.callThrough();

        const transaction = await Transaction.wrap(client);
        await transaction.commit();
        await transaction.commit();
        await transaction.commit();
        expect(client.query).toHaveBeenCalledWith('COMMIT');
        expect(spy.calls.all().map(c => c.args)).toEqual([['BEGIN'], ['COMMIT']]);
        done();
    });

    it('should rollback the transaction only once', async (done) => {
        const spy = spyOn(client, 'query').and.callThrough();

        const transaction = await Transaction.wrap(client);
        await transaction.rollback();
        await transaction.rollback();
        await transaction.rollback();
        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(spy.calls.all().map(c => c.args)).toEqual([['BEGIN'], ['ROLLBACK']]);
        done();
    });

    it('should rollback the transaction if commit fails', async (done) => {
        const failingClient: any = {
            query(text: string) {
                if (text === 'COMMIT') {
                    return Promise.reject('Failure!');
                } else {
                    return Promise.resolve();
                }
            },
        };
        const spy = spyOn(failingClient, 'query').and.callThrough();

        const transaction = await Transaction.wrap(failingClient);
        try {
            await transaction.commit();
            done.fail(new Error('Committing the transaction should fail.'));
        } catch (error) {
            expect(spy.calls.all().map(c => c.args)).toEqual([['BEGIN'], ['COMMIT'], ['ROLLBACK']]);
        } finally {
            done();
        }
    });

    it('should release the client if the rollback fails', async (done) => {
        const failingClient: any = {
            query(text: string) {
                if (text === 'ROLLBACK') {
                    return Promise.reject('Failure!');
                } else {
                    return Promise.resolve();
                }
            },
            release() {
                // Nothing happens on stub release
             }
        };
        const querySpy = spyOn(failingClient, 'query').and.callThrough();
        const releaseSpy = spyOn(failingClient, 'release').and.callThrough();

        const transaction = await Transaction.wrap(failingClient);
        try {
            await transaction.rollback();
            done.fail(new Error('Rolling back the transaction should fail.'));
        } catch (error) {
            expect(querySpy.calls.all().map(c => c.args)).toEqual([['BEGIN'], ['ROLLBACK']]);
            expect(releaseSpy).toHaveBeenCalled();
        } finally {
            done();
        }
    });

    it('should aggregate the errors if both commit and rollback fail', async (done) => {
        const failingClient: any = {
            query(text: string) {
                if (text === 'COMMIT' || text === 'ROLLBACK') {
                    return Promise.reject(new Error('Failure!'));
                } else {
                    return Promise.resolve();
                }
            }
        };

        const transaction = await Transaction.wrap(failingClient);
        try {
            await transaction.commit();
            done.fail(new Error('Committing the transaction should fail.'));
        } catch (error) {
            if (!(error instanceof AggregateError)) {
                done.fail(new Error('Error should be an aggregate error, instead got: ' + typeof error));
            } else {
                expect(error.cause).toBeDefined();
                expect(error.message).toEqual('this.client.release is not a function');
                expect(error.cause!.message).toEqual('Failure!');
            }
        } finally {
            done();
        }
    });
});
