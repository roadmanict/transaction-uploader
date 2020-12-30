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

type TransactionInput = Omit<Partial<TransactionDTO>, "amount"> & {
  amount?: string;
};

export class Transaction {
  public static Create({
    budgetID,
    accountNumber,
    accountID,
    date,
    amount: amountString,
    description,
    payeeID,
    payeeAccountNumber,
    payeeName,
  }: TransactionInput): Transaction | Error {
    if (!budgetID || budgetID.length === 0) {
      return new Error("Invalid budgetID");
    }
    if (!accountNumber || accountNumber.length === 0) {
      return new Error("Invalid accountNumber");
    }
    if (!accountID || accountID.length === 0) {
      return new Error("Invalid accountID");
    }
    if (!amountString || amountString.length === 0) {
      return new Error("Invalid amount");
    }
    if (!date) {
      return new Error("Invalid date");
    }
    let amount = parseInt(amountString);
    if (isNaN(amount)) {
      return new Error("Invalid amount");
    }
    amount = amount * 1000;
    if (typeof payeeID === "string" && payeeID.length === 0) {
      payeeID = undefined;
    }
    if (
      typeof payeeAccountNumber === "string" &&
      payeeAccountNumber.length === 0
    ) {
      payeeAccountNumber = undefined;
    }
    if (typeof payeeName === "string" && payeeName.length === 0) {
      payeeName = undefined;
    }
    if (typeof description === "string" && description.length === 0) {
      description = undefined;
    } else if (typeof description === "string" && description.length > 200) {
      description = description.substr(0, 200);
    }

    return new Transaction({
      budgetID,
      accountNumber,
      accountID,
      date,
      amount,
      description,
      payeeAccountNumber,
      payeeID,
      payeeName,
    });
  }

  private constructor(public readonly state: TransactionDTO) {}
}
