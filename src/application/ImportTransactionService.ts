import {BankRepository} from '../domain/BankRepository';
import {BudgetAppRepository} from '../domain/BudgetAppRepository';
import {filterDuplicateTransferTransactions} from '../scripts/filterDuplicateTransferTransactions';

export class ImportTransactionService {
  public constructor(
    private readonly bankRepository: BankRepository,
    private readonly budgetAppRepository: BudgetAppRepository
  ) {}

  public async execute(): Promise<void> {
    const transferPayees = await this.budgetAppRepository.getPayees();

    const transactions = await this.bankRepository.getNewTransactions(
      transferPayees
    );

    await this.budgetAppRepository.saveAll(
      filterDuplicateTransferTransactions(transactions)
    );
  }
}
