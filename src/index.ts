import {createASNYNABEntities} from './scripts/createYnabEntitiesFromASNCSVs';
import {uploadTransactions} from './scripts/uploadTransactions';
import {getYnabTransferPayees} from './scripts/getYnabTransferPayees';
import {accountsYNABMap, YNAB_ACCESS_TOKEN} from './config';
import {filterDuplicateTransferTransactions} from './scripts/filterDuplicateTransferTransactions';
import {getASNBankCSVExports} from './scripts/getASNBankCSVExports';
import {getTriodosBankCSVExports} from './scripts/getTriodosBankCSVExports';
import {ASNTransactionRepository} from './infrastructure/ASNTransactionRepository';

(async () => {
  await Promise.all([
    getASNBankCSVExports(),
    // getTriodosBankCSVExports(),
  ]);

  const transferPayees = await getYnabTransferPayees(
    YNAB_ACCESS_TOKEN,
    Object.values(accountsYNABMap).map(ynabIDs => {
      return ynabIDs!.budgetID;
    }),
    Object.values(accountsYNABMap).map(ynabIDs => {
      return ynabIDs!.ynabAccountID;
    })
  );

  const transactionRepository = new ASNTransactionRepository(
    accountsYNABMap,
    transferPayees,
    []
  );

  const transactions = filterDuplicateTransferTransactions(
    await createASNYNABEntities(transferPayees)
  );

  if (transactions.length > 0) {
    await uploadTransactions(YNAB_ACCESS_TOKEN, transactions);
  }
})();

process.on('unhandledRejection', reason => {
  throw reason;
});
