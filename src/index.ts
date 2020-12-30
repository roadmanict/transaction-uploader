import { createYNABEntities } from "./scripts/createYnabEntitiesFromASNCSVs";
import { uploadTransactions } from "./scripts/uploadTransactions";
import { getYnabTransferPayees } from "./scripts/getYnabTransferPayees";
import { accountsYNABMap, YNAB_ACCESS_TOKEN } from "./config";
import { filterDuplicateTransferTransactions } from "./scripts/filterDuplicateTransferTransactions";

(async () => {
  // fs.rmdirSync(CSV_DOWNLOAD_URL);
  // await getASNBankCSV();

  const transferPayees = await getYnabTransferPayees(
    YNAB_ACCESS_TOKEN,
    Object.values(accountsYNABMap).map((ynabIDs) => {
      return ynabIDs!.budgetID;
    }),
    Object.values(accountsYNABMap).map((ynabIDs) => {
      return ynabIDs!.ynabAccountID;
    })
  );

  const transactions = filterDuplicateTransferTransactions(
    await createYNABEntities(transferPayees)
  );

  await uploadTransactions(YNAB_ACCESS_TOKEN, transactions);
})();

process.on("unhandledRejection", (reason) => {
  throw reason;
});
