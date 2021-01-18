import {ASNTransactionRepository} from './ASNTransactionRepository';
import {CSVFieldName} from '../types';
import {Transaction} from '../domain/Transaction';

const csvRow =
  "10-01-2021,NL97ASNB8830219525,,,,,,EUR,1889.51,EUR,-33.34,10-01-2021,10-01-2021,7913,BEA,50559982,'t481ey/031711','Albert Heijn 1631     >GRONINGEN10.01.2021 17U04 KV005 KF81K1   MCC:5411 Contactloze betaling NLNEDERLAND',2\n";

const accountNumber = 'accountNumber';
const ynabIDsMap = {
  [accountNumber]: {
    budgetID: 'budgetID',
    ynabAccountID: 'ynabAccountID',
  },
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

describe('A ASNTransactionRepository', () => {
  describe('Parsing albertheijn transaction', () => {
    const asnTransactionRepository = new ASNTransactionRepository(
      ynabIDsMap,
      {},
      [
        {
          [CSVFieldName.AccountNumber]: accountNumber,
          [CSVFieldName.Amount]: '-33.34',
          [CSVFieldName.Date]: '10-01-2021',
          [CSVFieldName.Description]:
            'Albert Heijn 1631     >GRONINGEN10.01.2021 17U04 KV005 KF81K1   MCC:5411 Contactloze betaling NLNEDERLAND',
          [CSVFieldName.PayeeAccount]: '',
          [CSVFieldName.PayeeName]: '',
        },
      ]
    );

    let transactions: Transaction[];
    beforeEach(async () => {
      transactions = (await asnTransactionRepository.getAll()) as Transaction[];
    });

    it('Does not throw an error', () => {
      expect(transactions instanceof Error).toEqual(false);
    });

    it('Creates a correct transaction', () => {
      expect(transactions[0].state).toEqual({
        budgetID: 'budgetID',
        accountNumber: 'accountNumber',
        accountID: 'ynabAccountID',
        date: new Date('2021-01-10T00:00:00.000Z'),
        amount: -3334,
        description:
          'Albert Heijn 1631     >GRONINGEN10.01.2021 17U04 KV005 KF81K1   MCC:5411 Contactloze betaling NLNEDERLAND',
        payeeAccountNumber: undefined,
        payeeID: undefined,
        payeeName: undefined,
      });
    });
  });
});
