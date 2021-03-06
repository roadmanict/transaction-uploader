import {BankRepository} from '../domain/BankRepository';
import {BudgetAppRepository} from '../domain/BudgetAppRepository';
import {filterDuplicateTransferTransactions} from '../scripts/filterDuplicateTransferTransactions';
import {Transaction} from '../domain/Transaction';
import {inject, injectable} from 'tsyringe';

const payeeNameMatchers: Record<string, (description: string) => boolean> = {
  'Albert Heijn': (description: string) => /Albert Heijn/i.test(description),
  'ASN Bank': (description: string) => /CREDITRENTE/i.test(description),
  Bakker: (description: string) => /Bakker/i.test(description),
  'Cafetaria SIM': (description: string) => /CAFETARIA SIM/i.test(description),
  'De Hunze': (description: string) => /De Hunze/i.test(description),
  Ekoplaze: (description: string) => /ekoplaza/i.test(description),
  Infomedics: (description: string) => /Infomedics/i.test(description),
  Jumbo: (description: string) => /Jumbo/i.test(description),
  MediaMarkt: (description: string) => /MediaMarkt/i.test(description),
  Sawadee: (description: string) => /sawadee/i.test(description),
  'Slijterij Groningen': (description: string) =>
    /Slijterij Groningen/i.test(description),
  Thuisbezorgd: (description: string) => /Thuisbezorgd/i.test(description),
};

const findPayeeName = (transaction: Transaction): void => {
  for (const [payeeName, matcher] of Object.entries(payeeNameMatchers)) {
    if (!transaction.description) {
      continue;
    }

    if (matcher(transaction.description!)) {
      transaction.payeeName = payeeName;

      break;
    }
  }
};

@injectable()
export class ImportTransactionService {
  public constructor(
    @inject('BankRepository') private readonly bankRepository: BankRepository,
    @inject('BudgetAppRepository')
    private readonly budgetAppRepository: BudgetAppRepository
  ) {}

  public async execute(): Promise<void> {
    const transferPayees = await this.budgetAppRepository.getPayees();

    const transactions = await this.bankRepository.getNewTransactions(
      transferPayees
    );

    for (const transaction of transactions) {
      if (transaction.payeeID) {
        continue;
      }

      findPayeeName(transaction);
    }

    await this.budgetAppRepository.saveAll(
      // TODO does this belong here?
      filterDuplicateTransferTransactions(transactions)
    );
  }
}
