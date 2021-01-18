export interface TransferPayee {
  id: string;
  name: string;
  transfer_account_id: string;
}

export type BudgetTransferPayeeMap = Record<string, TransferPayee[]>;

export enum CSVFieldName {
  Date = 'Date',
  AccountNumber = 'AccountNumber',
  PayeeAccount = 'PayeeAccount',
  PayeeName = 'PayeeName',
  Amount = 'Amount',
  Description = 'Description',
}

export type CSVRow = Record<CSVFieldName, string>;

export interface YnabIDMap {
  [key: string]: {ynabAccountID: string; budgetID: string};
}
