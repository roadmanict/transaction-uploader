import {TransactionRepository} from '../domain/TransactionRepository';
import {Transaction} from '../domain/Transaction';
import {
  BudgetTransferPayeeMap,
  CSVFieldName,
  CSVRow,
  YnabIDMap,
} from '../types';

export class ASNTransactionRepository implements TransactionRepository {
  public constructor(
    private readonly accountsYNABMap: YnabIDMap,
    private readonly budgetTransferPayees: BudgetTransferPayeeMap,
    private readonly csvRows: CSVRow[]
  ) {}

  public async getAll(): Promise<Transaction[] | Error> {
    const transactions: Transaction[] = [];

    for (const csvRow of this.csvRows) {
      const transaction = this.parseRow(csvRow);
      if (transaction instanceof Error) {
        return transaction;
      }

      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private parseRow(csvRow: CSVRow): Transaction | undefined | Error {
    const accountNumber = csvRow[CSVFieldName.AccountNumber];
    const ynabIDs = this.accountsYNABMap[accountNumber || ''];
    if (!ynabIDs) {
      return;
    }

    const payeeAccountNumber = csvRow[CSVFieldName.PayeeAccount];
    const transferAccountID = this.accountsYNABMap[payeeAccountNumber || '']
      ?.ynabAccountID;
    let payeeID: string | undefined;

    if (transferAccountID) {
      const transferPayees = this.budgetTransferPayees[ynabIDs.budgetID];
      const transferPayee = transferPayees?.find(
        payee => payee.transfer_account_id === transferAccountID
      );
      if (transferPayee) {
        payeeID = transferPayee.id;
      }
    }

    let date: Date | undefined;
    const dateString = csvRow[CSVFieldName.Date];
    if (dateString) {
      const [day, month, year] = dateString.split('-');

      date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    }

    let amountInput = csvRow[CSVFieldName.Amount];
    const isNegative = amountInput.startsWith('-');
    if (isNegative) {
      amountInput = amountInput.substr(1, amountInput.length);
    }
    const [eurosString, centsString] = amountInput.split('.');
    const euros = parseInt(eurosString) * 100;
    if (isNaN(euros)) {
      return new Error('Invalid amount');
    }
    const cents = parseInt(centsString);
    if (isNaN(cents)) {
      return new Error('Invalid amount');
    }

    let amount = euros + cents;
    if (isNegative) {
      amount = amount * -1;
    }

    return Transaction.Create({
      budgetID: ynabIDs.budgetID,
      accountNumber: accountNumber,
      accountID: ynabIDs.ynabAccountID,
      date: date,
      amount: amount,
      description: csvRow[CSVFieldName.Description],
      payeeAccountNumber: payeeAccountNumber,
      payeeID: payeeID,
      payeeName: csvRow[CSVFieldName.PayeeName],
    });
  }
}
