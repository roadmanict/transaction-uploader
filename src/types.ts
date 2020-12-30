export interface TransferPayee {
  id: string;
  name: string;
  transfer_account_id: string;
}

export type BudgetTransferPayeeMap = Record<string, TransferPayee[]>;

export enum FieldName {
  Date = "Date",
  AccountNumber = "AccountNumber",
  PayeeAccount = "PayeeAccount",
  PayeeName = "PayeeName",
  Amount = "Amount",
  Description = "Description",
}
