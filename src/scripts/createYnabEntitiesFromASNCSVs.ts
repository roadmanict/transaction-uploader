import { Transaction } from "../entities/Transaction";
import fs from "fs";
import { CSV_DOWNLOAD_URL } from "./getASNBankCSVExports";
import path from "path";
import csv from "csv-parser";
import { accountsYNABMap } from "../config";
import { BudgetTransferPayeeMap, FieldName } from "../types";

const createFromRow = (
  budgetTransferPayees: BudgetTransferPayeeMap,
  row: { [key in FieldName]?: string }
): Transaction | Error | undefined => {
  let accountNumber = row[FieldName.AccountNumber];
  let ynabIDs = accountsYNABMap[accountNumber || ""];
  if (!ynabIDs) {
    return;
  }

  const payeeAccountNumber = row[FieldName.PayeeAccount];
  const transferAccountID =
    accountsYNABMap[payeeAccountNumber || ""]?.ynabAccountID;
  let payeeID: string | undefined;

  if (transferAccountID) {
    const transferPayees = budgetTransferPayees[ynabIDs.budgetID];
    const transferPayee = transferPayees?.find(
      (payee) => payee.transfer_account_id === transferAccountID
    );
    if (transferPayee) {
      payeeID = transferPayee.id;
    }
  }

  let date: Date | undefined;
  const dateString = row[FieldName.Date];
  if (dateString) {
    const [day, month, year] = dateString.split("-");

    date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  }

  return Transaction.Create({
    budgetID: ynabIDs.budgetID,
    accountNumber: accountNumber,
    accountID: ynabIDs.ynabAccountID,
    date: date,
    amount: row[FieldName.Amount],
    description: row[FieldName.Description],
    payeeAccountNumber: payeeAccountNumber,
    payeeID: payeeID,
    payeeName: row[FieldName.PayeeName],
  });
};

export const createYNABEntities = async (
  budgetTransferPayees: BudgetTransferPayeeMap
): Promise<Transaction[]> => {
  const exportFiles = fs.readdirSync(CSV_DOWNLOAD_URL);

  const entities: Transaction[] = [];

  for (const file of exportFiles) {
    await new Promise((resolve) => {
      fs.createReadStream(path.join(CSV_DOWNLOAD_URL, file))
        .pipe(
          csv({
            headers: [
              FieldName.Date,
              FieldName.AccountNumber,
              FieldName.PayeeAccount,
              FieldName.PayeeName,
              "4",
              "5",
              "6",
              "7",
              "7",
              "8",
              FieldName.Amount,
              "9",
              "10",
              "11",
              "12",
              "13",
              "14",
              FieldName.Description,
            ],
          })
        )
        .on("data", (row) => {
          const entity = createFromRow(budgetTransferPayees, row);
          if (!entity) {
            return;
          } else if (entity instanceof Error) {
            throw entity;
          }

          entities.push(entity);
        })
        .on("end", () => {
          resolve(undefined);
        });
    });
  }

  return entities;
};
