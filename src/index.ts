import {accountsYNABMap, YNAB_ACCESS_TOKEN} from './config';
import {ASNTransactionRepository} from './infrastructure/ASNTransactionRepository';
import {ImportTransactionService} from './application/ImportTransactionService';
import {ASNTransactionDownloader} from './infrastructure/ASNTransactionDownloader';
import {YnabRepository} from './infrastructure/YnabRepository';

(async () => {
  const transactionRepository = new ASNTransactionRepository(
    new ASNTransactionDownloader(),
    accountsYNABMap
  );
  const importTransactionService = new ImportTransactionService(
    transactionRepository,
    new YnabRepository(
      YNAB_ACCESS_TOKEN,
      Object.values(accountsYNABMap).map(ynabIDs => {
        return ynabIDs!.ynabAccountID;
      }),
      Object.values(accountsYNABMap).map(ynabIDs => {
        return ynabIDs!.budgetID;
      })
    )
  );

  await importTransactionService.execute();
})();

process.on('unhandledRejection', reason => {
  throw reason;
});
