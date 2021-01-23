import {Transaction} from './Transaction';
import {TransferPayeeMap} from './TransferPayee';

export interface BudgetAppRepository {
  getPayees: () => Promise<TransferPayeeMap>;
  saveAll: (transactions: Transaction[]) => Promise<void>;
}
