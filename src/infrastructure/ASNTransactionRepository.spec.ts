import {mockContainer} from '../../spec/mockContainer';
import {ASNBankRepository} from './ASNBankRepository';
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
  const localMockContainer = mockContainer.createChildContainer();
  localMockContainer.register('YnabIDMap', {useValue: ynabIDsMap});

  const asnTransactionDownloaderMock = localMockContainer.resolve(
    ASNTransactionDownloader
  );

  const asnTransactionRepository = localMockContainer.resolve(
    ASNBankRepository
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
        payeeName: 'sitedish nl via mollie',
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

      expect(transactions[8].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: accountNumber,
        accountID: 'ynabAccountID',
        date: new Date('2021-01-13T00:00:00.000Z'),
        amount: -3000,
        description:
          "'09775163199 0030005914985247 Invoice 62135944249071 Infomedics Referentie: 2021-01-13 19:09 003000591498524'",
        payeeAccountNumber: 'NL34ABNA0243240058',
        payeeID: undefined,
        payeeName: 'infomedics b v',
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
