export enum CSVFieldName {
  Date = 'Date',
  AccountNumber = 'AccountNumber',
  PayeeAccount = 'PayeeAccount',
  PayeeName = 'PayeeName',
  Amount = 'Amount',
  Description = 'Description',
}

export type CSVRow = Record<CSVFieldName, string>;
