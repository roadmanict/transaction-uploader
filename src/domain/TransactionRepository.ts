import {Transaction} from './Transaction';

export interface TransactionRepository {
  getAll: () => Promise<Transaction[] | Error>;
}
