export interface TransferPayee {
  id: string;
  name: string;
  transfer_account_id: string;
}

export type TransferPayeeMap = Record<string, TransferPayee[]>;
