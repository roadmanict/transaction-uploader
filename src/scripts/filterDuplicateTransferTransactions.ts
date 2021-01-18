import {Transaction} from '../domain/Transaction';

export const filterDuplicateTransferTransactions = (
  transactions: Transaction[]
): Transaction[] => {
  const normalTransactions = transactions.filter(
    transaction => !transaction.state.payeeID
  );
  const transferTransactions = transactions.filter(
    transaction => transaction.state.payeeID
  );

  normalTransactions.push(
    ...transferTransactions.filter(transactionA => {
      return !!transferTransactions.find(transactionB => {
        return (
          transactionA.state.budgetID === transactionB.state.budgetID &&
          transactionA.state.accountNumber ===
            transactionB.state.payeeAccountNumber &&
          transactionA.state.payeeAccountNumber ===
            transactionB.state.accountNumber &&
          Math.abs(transactionA.state.amount) ===
            Math.abs(transactionB.state.amount) &&
          transactionA.state.amount > 0
        );
      });
    })
  );

  return normalTransactions;
};
