import {Transaction} from '../domain/Transaction';
import * as fs from 'fs';
import {CSV_DOWNLOAD_URL} from './getASNBankCSVExports';
import * as path from 'path';
import * as csv from 'csv-parser';
import {accountsYNABMap} from '../config';
import {BudgetTransferPayeeMap, CSVFieldName} from '../types';
import {Readable} from 'stream';

export const asnCSVParser = csv({
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

export const createTransactionFromRow = (
  budgetTransferPayees: BudgetTransferPayeeMap,
  row: {[key in CSVFieldName]?: string}
): Transaction | Error | undefined => {
  const accountNumber = row[CSVFieldName.AccountNumber];
  const ynabIDs = accountsYNABMap[accountNumber || ''];
  if (!ynabIDs) {
    return;
  }

  const payeeAccountNumber = row[CSVFieldName.PayeeAccount];
  const transferAccountID =
    accountsYNABMap[payeeAccountNumber || '']?.ynabAccountID;
  let payeeID: string | undefined;

  if (transferAccountID) {
    const transferPayees = budgetTransferPayees[ynabIDs.budgetID];
    const transferPayee = transferPayees?.find(
      payee => payee.transfer_account_id === transferAccountID
    );
    if (transferPayee) {
      payeeID = transferPayee.id;
    }
  }

  let date: Date | undefined;
  const dateString = row[CSVFieldName.Date];
  if (dateString) {
    const [day, month, year] = dateString.split('-');

    date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  }

  const amount = parseInt(row[CSVFieldName.Amount] ?? '0');

  return Transaction.Create({
    budgetID: ynabIDs.budgetID,
    accountNumber: accountNumber,
    accountID: ynabIDs.ynabAccountID,
    date: date,
    amount: amount,
    description: row[CSVFieldName.Description],
    payeeAccountNumber: payeeAccountNumber,
    payeeID: payeeID,
    payeeName: row[CSVFieldName.PayeeName],
  });
};

export const handleReadable = (readable: Readable): Promise<any[]> => {
  const parsedRows: any[] = [];

  return new Promise(resolve => {
    readable
      .pipe(asnCSVParser)
      .on('data', row => {
        parsedRows.push(row);
      })
      .on('end', () => {
        resolve(parsedRows);
      });
  });
};

export const createASNYNABEntities = async (
  budgetTransferPayees: BudgetTransferPayeeMap
): Promise<Transaction[]> => {
  const exportFiles = fs.readdirSync(CSV_DOWNLOAD_URL);

  const entities: Transaction[] = [];

  for (const file of exportFiles) {
    const rows = await handleReadable(
      fs.createReadStream(path.join(CSV_DOWNLOAD_URL, file))
    );

    for (const row of rows) {
      const entity = createTransactionFromRow(budgetTransferPayees, row);
      if (!entity) {
        continue;
      } else if (entity instanceof Error) {
        throw entity;
      }

      entities.push(entity);
    }
  }

  return entities;
};
