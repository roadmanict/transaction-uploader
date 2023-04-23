import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

export const options: puppeteer.PuppeteerLaunchOptions = {
  headless: false,
  slowMo: 250, // slow down by 250ms
};

export const CSV_DOWNLOAD_URL = '/tmp/triodos-csvs';

const TRIODOS_BANK_LOGIN_URL =
  'https://bankieren.triodos.nl/ib-seam/login.seam?locale=nl_NL';

const IS_LOGGED_IN_SELECTOR =
  'body > app-root > div.container.hide-on-small-screen.ng-tns-c158-0 > div.row.header.ng-tns-c158-0 > div.col-2.header__logout.ng-tns-c158-0 > tri-button > button';

const TRIODOS_DOWNLOAD_CSV_URL =
  'https://www.asnbank.nl/onlinebankieren/bankieren/secure/transacties/transactieoverzicht.html?pageName=spaar';

const DOWNLOAD_SEARCH_SELECTOR =
  '#downloadForm\\:downloadMode_dec\\:zdownloadMode\\:downloadMode\\:1';

const ACCOUNT_SELECT_SELECTOR =
  '#downloadForm\\:freeSearchFields\\:j_idt165\\:multiple_accountSelectionListMultiple';

const ACCOUNT_OPTION_SELECTOR = `${ACCOUNT_SELECT_SELECTOR} > option`;

const TRANSACTIONS_FROM_SELECTOR =
  '#downloadForm\\:freeSearchFields\\:j_idt204\\:ddateFrom\\:zdateFrom\\:dateFromInputDate';

const PREVIOUS_DATE_SELECTOR =
  '#downloadForm\\:downloadOverview\\:reportTable\\:0\\:j_idt494';

const CREATE_EXPORT_BUTTON_SELECTOR = '#downloadForm';

const DOWNLOAD_BUTTON =
  '#downloadForm\\:downloadOverview\\:reportTable\\:0\\:saveLink';

export const getTriodosBankCSVExports = async () => {
  console.log("Started downloading Triodos BANK csv's");

  try {
    fs.rmdirSync(CSV_DOWNLOAD_URL);
  } catch (error) {
    //
  }

  const browser = await puppeteer.launch(options);

  const page = await browser.newPage();

  // @ts-expect-error _client not available publicly
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: CSV_DOWNLOAD_URL,
  });

  await page.goto(TRIODOS_BANK_LOGIN_URL);

  await page.waitForSelector(IS_LOGGED_IN_SELECTOR);

  await page.goto(TRIODOS_DOWNLOAD_CSV_URL);

  await page.click(DOWNLOAD_SEARCH_SELECTOR);

  const accountSelector = await page.$(ACCOUNT_SELECT_SELECTOR);
  if (!accountSelector) {
    throw new Error('Account Select object not found');
  }

  const accountValues = await Promise.all(
    (
      await page.$$(ACCOUNT_OPTION_SELECTOR)
    ).map(element => element.getProperty('value'))
  );

  const selectOptions: string[] = (await Promise.all(
    accountValues.map(value => value.jsonValue())
  )) as string[];

  console.log();

  await accountSelector.select(...selectOptions);

  const previousDateValue = (await (
    await page.$(PREVIOUS_DATE_SELECTOR)
  )?.jsonValue()) as string | undefined;

  const [previousDate] = previousDateValue?.split(' ') || [];

  let timestamp = Date.now();
  timestamp = timestamp - 1000 * 60 * 60 * 24 * 30;
  const previousMonth = new Date(timestamp);
  await page.type(
    TRANSACTIONS_FROM_SELECTOR,
    previousDate ??
      `${previousMonth.getDay()}-${previousMonth.getMonth()}-${previousMonth.getFullYear()}`
  );

  await page.click(CREATE_EXPORT_BUTTON_SELECTOR);

  setTimeout(async () => {
    await page.reload();

    await page.click(DOWNLOAD_BUTTON);

    // await browser.close();

    console.log('Finished script');
  }, 1000);
};
