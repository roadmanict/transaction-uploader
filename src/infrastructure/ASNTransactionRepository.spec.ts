import {ASNTransactionRepository} from './ASNTransactionRepository';
import {Transaction} from '../domain/Transaction';
import {ASNTransactionDownloader} from './ASNTransactionDownloader';
import path from 'path';

const accountNumber = 'myPersonalAccountNumber';
const ynabIDsMap = {
  [accountNumber]: {
    budgetID: 'budgetID',
    ynabAccountID: 'ynabAccountID',
  },
};

describe('A ASNTransactionRepository', () => {
  const asnTransactionDownloaderMock = {} as ASNTransactionDownloader;

  const asnTransactionRepository = new ASNTransactionRepository(
    asnTransactionDownloaderMock,
    ynabIDsMap
  );

  describe('Parsing multiple transactions', () => {
    let transactions: Transaction[];

    beforeEach(async () => {
      const mockExportFile = path.join(
        path.dirname(module.filename),
        '__files__',
        'transactionExport.csv'
      );

      asnTransactionDownloaderMock.downloadTransactions = () =>
        Promise.resolve([mockExportFile]);

      transactions = await asnTransactionRepository.getNewTransactions({});
    });

    it('Creates all transactions', () => {
      expect(transactions.length).toEqual(16);
    });

    it('Creates correct transaction 0', () => {
      expect(transactions[0].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: accountNumber,
        accountID: 'ynabAccountID',
        date: new Date('2021-01-04T00:00:00.000Z'),
        amount: -2620,
        description:
          "'M01968481M8X26RK 1150001402792064 ?61661?: iDEAL Betaling Kohinoor va Referentie: 2021-01-04 17:21 115000140279206'",
        payeeAccountNumber: 'NL51DEUT0265262461',
        payeeID: undefined,
        payeeName: undefined,
      });

      expect(transactions[1].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: accountNumber,
        accountID: 'ynabAccountID',
        date: new Date('2021-01-05T00:00:00.000Z'),
        amount: 1,
        description: "'CREDITRENTE                     TOT 01-01-21'",
        payeeAccountNumber: undefined,
        payeeID: undefined,
        payeeName: undefined,
      });

      expect(transactions[2].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: accountNumber,
        accountID: 'ynabAccountID',
        date: new Date('2021-01-07T00:00:00.000Z'),
        amount: -1430,
        description:
          "'Eetcounter De Hunze   >GRONINGEN 7.01.2021 12U17 KV005 054049EQ MCC:5814                      NLNEDERLAND'",
        payeeAccountNumber: undefined,
        payeeID: undefined,
        payeeName: undefined,
      });

      expect(transactions[3].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: accountNumber,
        accountID: 'ynabAccountID',
        date: new Date('2021-01-10T00:00:00.000Z'),
        amount: -3334,
        description:
          "'Albert Heijn 1631     >GRONINGEN10.01.2021 17U04 KV005 KF81K1   MCC:5411 Contactloze betaling NLNEDERLAND'",
        payeeAccountNumber: undefined,
        payeeID: undefined,
        payeeName: undefined,
      });
    });
  });

  describe('Parsing a multiple files', () => {
    let transactions: Transaction[];

    beforeEach(async () => {
      const mockExportFile1 = path.join(
        path.dirname(module.filename),
        '__files__',
        'transactionExport.csv'
      );
      const mockExportFile2 = path.join(
        path.dirname(module.filename),
        '__files__',
        'extraExport.csv'
      );

      asnTransactionDownloaderMock.downloadTransactions = () =>
        Promise.resolve([mockExportFile1, mockExportFile2]);

      transactions = await asnTransactionRepository.getNewTransactions({});
    });

    it('Creates all transactions', () => {
      expect(transactions.length).toEqual(17);
    });
  });
});
