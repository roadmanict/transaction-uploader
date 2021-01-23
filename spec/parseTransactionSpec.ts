// import {
//   createTransactionFromRow,
//   handleReadable,
// } from '../src/scripts/createYnabEntitiesFromASNCSVs';
// import {Readable} from 'stream';
// import {Transaction} from '../src/domain/Transaction';
//
// type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
//
// describe('When parsing a transaction', () => {
//
//   // eslint-disable-next-line node/no-unsupported-features/node-builtins
//   const readableCSVRow = Readable.from(csvRow);
//
//   let parsedRows: ThenArg<ReturnType<typeof handleReadable>>;
//   let transaction: Transaction;
//
//   beforeAll(async () => {
//     parsedRows = await handleReadable(readableCSVRow);
//     transaction = createTransactionFromRow({}, parsedRows[0]) as Transaction;
//   });
//
//   it('Transaction is not an error', () => {
//     expect(transaction instanceof Error).toBeFalse();
//   });
//
//   it('Has the correct accountNumber', () => {
//     expect(transaction.state.accountNumber).toEqual('myPersonalAccountNumber');
//   });
//
//   it('Has the correct amount', () => {
//     expect(transaction.state.amount).toEqual(-33.34);
//   });
// });
