import {Transaction} from '../domain/Transaction';
import axios from 'axios';

export const uploadTransactions = async (
  ynabAccessToken: string,
  transactions: Transaction[]
): Promise<void> => {
  const transactionsByBudgetID: Record<string, Transaction[]> = {};

  transactions.forEach(transaction => {
    const transactions =
      transactionsByBudgetID[transaction.state.budgetID] || [];
    transactions.push(transaction);
    transactionsByBudgetID[transaction.state.budgetID] = transactions;
  });

  for (const [budgetID, transactions] of Object.entries(
    transactionsByBudgetID
  )) {
    const response = await axios.post(
      `https://api.youneedabudget.com/v1/budgets/${budgetID}/transactions`,
      {
        transactions: transactions.map(transaction => ({
          account_id: transaction.state.accountID,
          amount: transaction.state.amount * 1000,
          date: transaction.state.date.toISOString(),
          memo: transaction.state.description,
          payee_id: transaction.state.payeeID,
          payee_name: transaction.state.payeeName,
          cleared: 'cleared',
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${ynabAccessToken}`,
        },
        validateStatus: status => {
          return status >= 200 && status < 500;
        },
      }
    );
    if (response.status !== 201) {
      throw new Error(`Invalid response: ${JSON.stringify(response.data)}`);
    }
  }
};
