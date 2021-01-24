import {Transaction} from './Transaction';

describe('A Transaction', () => {
  describe('Creating with all properties', () => {
    const result = Transaction.Create({
      budgetID: 'budgetID',
      accountNumber: 'acountNumber',
      accountID: 'accountID',
      date: new Date(),
      amount: 1500,
      description: 'description',
      payeeID: 'payeeID',
      payeeAccountNumber: 'payeeAccountNumber',
      payeeName: 'payeeName',
    }) as Transaction;

    it('Does not return an error', () => {
      expect(result instanceof Error).toEqual(false);
    });

    expect(result.state).toEqual({
      accountID: 'accountID',
      accountNumber: 'acountNumber',
      amount: 1500,
      budgetID: 'budgetID',
      date: expect.any(Date),
      description: 'description',
      payeeAccountNumber: 'payeeAccountNumber',
      payeeID: 'payeeID',
      payeeName: 'payeeName',
    });
  });

  describe('Creating with empty strings', () => {
    const result = Transaction.Create({
      budgetID: 'budgetID',
      accountNumber: 'acountNumber',
      accountID: 'accountID',
      date: new Date(),
      amount: 1500,
      description: '',
      payeeID: '',
      payeeAccountNumber: '',
      payeeName: '',
    }) as Transaction;

    it('Does not return an error', () => {
      expect(result instanceof Error).toEqual(false);
    });

    expect(result.state).toEqual({
      accountID: 'accountID',
      accountNumber: 'acountNumber',
      amount: 1500,
      budgetID: 'budgetID',
      date: expect.any(Date),
      description: undefined,
      payeeAccountNumber: undefined,
      payeeID: undefined,
      payeeName: undefined,
    });
  });

  describe('Creating with minimum values', () => {
    const result = Transaction.Create({
      budgetID: 'budgetID',
      accountNumber: 'acountNumber',
      accountID: 'accountID',
      date: new Date(),
      amount: 1500,
    }) as Transaction;

    it('Does not return an error', () => {
      expect(result instanceof Error).toEqual(false);
    });

    expect(result.state).toEqual({
      accountID: 'accountID',
      accountNumber: 'acountNumber',
      amount: 1500,
      budgetID: 'budgetID',
      date: expect.any(Date),
      description: undefined,
      payeeAccountNumber: undefined,
      payeeID: undefined,
      payeeName: undefined,
    });
  });

  describe('Creating without values', () => {
    it('Throws an error', () => {
      expect(() => Transaction.Create({})).toThrow();
    });
  });
});
