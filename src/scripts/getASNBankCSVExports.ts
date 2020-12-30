import puppeteer from "puppeteer";

export let options: undefined | puppeteer.LaunchOptions;
// Debug options
options = {
  headless: false,
  slowMo: 250, // slow down by 250ms
};

const ASN_BANK_LOGIN_URL =
  "https://www.asnbank.nl/online/web/onlinebankieren/inloggen/#/inloggen";

export const CSV_DOWNLOAD_URL = "/tmp/asn-csvs";

const QR_CODE_SELECTOR =
  "body > mijn-login > div > inloggen > ap-grid-row > div > ap-grid-col > div > div > ap-sign > div > ap-token-selector > div:nth-child(3) > ap-button > button";

const IS_LOGGED_IN_SELECTOR =
  "#header > header > div.serviceheader-inner--left > ul > li.navbar__list--greeting";

const TRANSACTION_SUMMARY_SELECTOR = "#bet_transactieoverzicht";

const ACCOUNTS_SELECTOR = "#sl_accountNr_rekening";

const ACCOUNTS_LOOP_SELECTOR =
  "#transactionAccountSelection > table > tbody > tr > td:nth-child(2) > div > div.accountSelectMultilineList.default > ul > li";

const SUMMARY_DOWNLOAD_SECTION_SELECTOR = "#downloaden";

const SUMMARY_SINCE_LAST_DOWNLOAD_SELECTOR = "#downloadtype";

const SUMMARY_DOWNLOAD_BUTTON_SELECTOR = "#downloadenFinal";

const getASNBankCSVExports = async () => {
  console.log("Started downloading ASN BANK csv's");

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  // @ts-expect-error
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: CSV_DOWNLOAD_URL,
  });

  await page.goto(ASN_BANK_LOGIN_URL);

  await page.click(QR_CODE_SELECTOR);

  await page.waitForSelector(IS_LOGGED_IN_SELECTOR);

  await page.click(TRANSACTION_SUMMARY_SELECTOR);

  let accountsSelectors = await page.$$(ACCOUNTS_LOOP_SELECTOR);
  for (let i = 0; i < accountsSelectors.length; i++) {
    accountsSelectors = await page.$$(ACCOUNTS_LOOP_SELECTOR);
    await page.click(ACCOUNTS_SELECTOR);
    await accountsSelectors[i].click();

    await page.click(SUMMARY_DOWNLOAD_SECTION_SELECTOR);
    await page.click(SUMMARY_SINCE_LAST_DOWNLOAD_SELECTOR);
    await page.click(SUMMARY_DOWNLOAD_BUTTON_SELECTOR);
  }

  await browser.close();

  console.log("Finished script");
};
