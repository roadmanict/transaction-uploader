import axios from "axios";
import { BudgetTransferPayeeMap } from "../types";

export const getYnabTransferPayees = async (
  ynabAccessToken: string,
  budgetIDs: string[],
  accountIDs: string[]
): Promise<BudgetTransferPayeeMap> => {
  const transferPayees: BudgetTransferPayeeMap = {};

  for (const budgetID of budgetIDs) {
    transferPayees[budgetID] = [];

    const response = await axios.get(
      `https://api.youneedabudget.com/v1/budgets/${budgetID}/payees`,
      {
        headers: {
          Authorization: `Bearer ${ynabAccessToken}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(JSON.stringify(response.data));
    }

    for (const payee of response.data.data.payees) {
      if (payee.deleted || payee.transfer_account_id === null) {
        continue;
      }

      if (accountIDs.includes(payee.transfer_account_id)) {
        transferPayees[budgetID].push(payee);
      }
    }
  }

  return transferPayees;
};
