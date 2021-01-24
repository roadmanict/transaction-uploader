interface TransactionDTO {
  budgetID: string;
  accountNumber: string;
  accountID: string;
  date: Date;
  amount: number;
  description?: string;
  payeeID?: string;
  payeeAccountNumber?: string;
  payeeName?: string;
}

export const isUndefined = (value: unknown): value is undefined => {
  return typeof value === 'undefined';
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isOptionalString = (
  value: unknown
): value is string | undefined => {
  return isString(value) || isUndefined(value);
};

type TransactionInput = Partial<Record<keyof TransactionDTO, unknown>>;

export class Transaction {
  public static Create({
    budgetID,
    accountNumber,
    accountID,
    date,
    amount,
    description,
    payeeID: payeeIDInput,
    payeeAccountNumber: payeeAccountNumberInput,
    payeeName: payeeNameInput,
  }: TransactionInput): Transaction {
    if (!isString(budgetID) || budgetID.length === 0) {
      throw new Error('Invalid budgetID');
    }
    if (!isString(accountNumber) || accountNumber.length === 0) {
      throw new Error('Invalid accountNumber');
    }
    if (!isString(accountID) || accountID.length === 0) {
      throw new Error('Invalid accountID');
    }
    if (!date) {
      throw new Error('Invalid date');
    }
    if (!isNumber(amount)) {
      throw new Error('Invalid amount');
    }
    if (!isOptionalString(payeeIDInput)) {
      throw new Error('Invalid payeeIDInput');
    }
    let payeeID = payeeIDInput;
    if (isString(payeeID) && payeeID.length === 0) {
      payeeID = undefined;
    }

    if (!isOptionalString(payeeAccountNumberInput)) {
      throw new Error('Invalid payeeAccountNumber');
    }
    let payeeAccountNumber = payeeAccountNumberInput;
    if (isString(payeeAccountNumber) && payeeAccountNumber.length === 0) {
      payeeAccountNumber = undefined;
    }
    if (!isOptionalString(payeeNameInput)) {
      throw new Error('Invalid payeeName');
    }
    let payeeName = payeeNameInput;
    if (isString(payeeName) && payeeName.length === 0) {
      payeeName = undefined;
    }
    if (!(date instanceof Date)) {
      throw new Error('Invalid date');
    }
    if (!isOptionalString(description)) {
      throw new Error('Invalid description');
    }

    let desc = description;
    if (isString(desc) && desc.length === 0) {
      desc = undefined;
    }
    if (isString(desc) && desc.length > 200) {
      desc = desc.substr(0, 200);
    }

    return new Transaction({
      budgetID,
      accountNumber,
      accountID,
      date,
      amount,
      description: desc,
      payeeAccountNumber,
      payeeID,
      payeeName,
    });
  }

  private constructor(public readonly state: TransactionDTO) {}

  public get description(): string | undefined {
    return this.state.description;
  }

  public set payeeName(payeeName: string | undefined) {
    this.state.payeeName = payeeName;
  }

  public get payeeID(): string | undefined {
    return this.state.payeeID;
  }
}
