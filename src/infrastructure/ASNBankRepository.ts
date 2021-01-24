import {BankRepository} from '../domain/BankRepository';
import {Transaction} from '../domain/Transaction';
import {YnabIDMap} from '../types';
import {ASNTransactionDownloader} from './ASNTransactionDownloader';
import fs from 'fs';
import csv from 'csv-parser';
import {CSVFieldName, CSVRow} from './types';
import {TransferPayeeMap} from '../domain/TransferPayee';
import {inject, injectable} from 'tsyringe';

const createASNCSVParser = () =>
  csv({
    headers: [
      CSVFieldName.Date,
      CSVFieldName.AccountNumber,
      CSVFieldName.PayeeAccount,
      CSVFieldName.PayeeName,
      '4',
      '5',
      '6',
      '7',
      '7',
      '8',
      CSVFieldName.Amount,
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      CSVFieldName.Description,
    ],
  });

@injectable()
export class ASNBankRepository implements BankRepository {
  public constructor(
    private readonly asnTransactionDownloader: ASNTransactionDownloader,
    @inject('YnabIDMap') private readonly accountsYNABMap: YnabIDMap
  ) {}

  public async getNewTransactions(
    transferPayeeMap: TransferPayeeMap
  ): Promise<Transaction[]> {
    const transactionExports = await this.asnTransactionDownloader.downloadTransactions();

    const csvRows = await this.readTransactionExports(transactionExports);

    const transactions: Transaction[] = [];

    for (const csvRow of csvRows) {
      const transaction = this.deserializeTransaction(csvRow, transferPayeeMap);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private async readTransactionExports(
    transactionExports: string[]
  ): Promise<CSVRow[]> {
    const csvRows: CSVRow[] = [];

    for (const file of transactionExports) {
      csvRows.push(...(await this.handleReadable(file)));
    }

    return csvRows;
  }

  private handleReadable(filename: string): Promise<CSVRow[]> {
    const parsedRows: CSVRow[] = [];

    return new Promise<CSVRow[]>((resolve, reject) => {
      fs.createReadStream(filename)
        .on('error', err => {
          reject(err);
        })
        .pipe(createASNCSVParser())
        .on('data', row => {
          parsedRows.push(row);
        })
        .on('end', () => {
          resolve(parsedRows);
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  private deserializeTransaction(
    csvRow: CSVRow,
    transferPayeeMap: TransferPayeeMap
  ): Transaction | undefined {
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
      const transferPayees = transferPayeeMap[ynabIDs.budgetID];
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
      throw new Error('Invalid amount');
    }
    const cents = parseInt(centsString);
    if (isNaN(cents)) {
      throw new Error('Invalid amount');
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
