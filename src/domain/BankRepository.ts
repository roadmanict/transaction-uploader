import {Transaction} from './Transaction';
import {TransferPayeeMap} from './TransferPayee';

export interface BankRepository {
  getNewTransactions: (
    transferPayeeMap: TransferPayeeMap
  ) => Promise<Transaction[]>;
}
