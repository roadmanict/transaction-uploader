import {BudgetAppRepository} from '../domain/BudgetAppRepository';
import {Transaction} from '../domain/Transaction';
import axios from 'axios';
import {TransferPayeeMap} from '../domain/TransferPayee';
import {inject, injectable} from 'tsyringe';

const axiosClient = axios.create({
  validateStatus: () => true,
});

@injectable()
export class YnabRepository implements BudgetAppRepository {
  public constructor(
    @inject('YnabAccessToken') private readonly ynabAccessToken: string,
    @inject('accountIDs') private readonly accountIDs: string[],
    @inject('budgetIDs') private readonly budgetIDs: string[]
  ) {}

  public async getPayees(): Promise<TransferPayeeMap> {
    const transferPayees: TransferPayeeMap = {};

    for (const budgetID of this.budgetIDs) {
      transferPayees[budgetID] = [];

      const response = await axiosClient.get(
        `https://api.youneedabudget.com/v1/budgets/${budgetID}/payees`,
        {
          headers: {
            Authorization: `Bearer ${this.ynabAccessToken}`,
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

        if (this.accountIDs.includes(payee.transfer_account_id)) {
          transferPayees[budgetID].push(payee);
        }
      }
    }

    return transferPayees;
  }

  public async saveAll(transactions: Transaction[]): Promise<void> {
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
      const response = await axiosClient.post(
        `https://api.youneedabudget.com/v1/budgets/${budgetID}/transactions`,
        {
          transactions: transactions.map(transaction => ({
            account_id: transaction.state.accountID,
            amount: transaction.state.amount * 10,
            date: transaction.state.date.toISOString(),
            memo: transaction.state.description,
            payee_id: transaction.state.payeeID,
            payee_name: transaction.state.payeeName,
            cleared: 'cleared',
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${this.ynabAccessToken}`,
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
  }
}

