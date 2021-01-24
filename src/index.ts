import 'reflect-metadata';
import {accountsYNABMap, YNAB_ACCESS_TOKEN} from './config';
import {ASNBankRepository} from './infrastructure/ASNBankRepository';
import {ImportTransactionService} from './application/ImportTransactionService';
import {YnabRepository} from './infrastructure/YnabRepository';
import {container} from 'tsyringe';

container.register('BankRepository', {useClass: ASNBankRepository});
container.register('YnabIDMap', {useValue: accountsYNABMap});
container.register('BudgetAppRepository', {useClass: YnabRepository});
container.register('YnabAccessToken', {useValue: YNAB_ACCESS_TOKEN});
container.register('accountIDs', {
  useValue: Object.values(accountsYNABMap).map(ynabIDs => {
    return ynabIDs.ynabAccountID;
  }),
});
container.register('budgetIDs', {
  useValue: Object.values(accountsYNABMap).map(ynabIDs => {
    return ynabIDs.budgetID;
  }),
});

const importTransactionService = container.resolve(ImportTransactionService);

(async () => {
  await importTransactionService.execute();
})();

process.on('unhandledRejection', reason => {
  throw reason;
});
