import fs from 'fs';
import puppeteer from 'puppeteer';
import path from 'path';
import {injectable} from 'tsyringe';
import * as util from 'util';

export const options: puppeteer.LaunchOptions = {
  headless: false,
  slowMo: 250, // slow down by 250ms
};

const ASN_BANK_LOGIN_URL =
  'https://www.asnbank.nl/online/web/onlinebankieren/inloggen/#/inloggen';

export const CSV_DOWNLOAD_URL = '/tmp/asn-csvs';

const QR_CODE_SELECTOR =
  'div.ap-container:nth-child(3) > ap-button:nth-child(1) > button:nth-child(1)';

const IS_LOGGED_IN_SELECTOR =
  'html body.ap.mijn-overzicht-template__body--secondary mijn-omgeving div.mijn-omgeving ng-component mijn-overzicht-web mijn-overzicht-wrapper mijn-overzicht div.mijn-overzicht overview.ng-star-inserted mijn-overzicht-template div.mijn-overzicht-template.mijn-overzicht-template--secondary ap-header.ng-tns-c72-0.ng-star-inserted header.ng-tns-c72-0.ap-header.ap-header__border-bottom div.ng-tns-c72-0.canvas-medium div.ap-header__container.ng-tns-c72-0 a.ap-header__logo-container.ng-tns-c72-0.ng-star-inserted ap-icon.ng-tns-c72-0 div.ap-icon.ap-icon--logo.ap-icon--primary.ap-icon--small.ap-icon-container';

const TRANSACTION_SUMMARY_URL = 'https://www.asnbank.nl/onlinebankieren/bankieren/secure/transacties/transactieoverzicht.html?pageName=spaar';
  
const TRANSACTION_SUMMARY_SELECTOR = '#bet_transactieoverzicht';

const ACCOUNTS_SELECTOR = '#sl_accountNr_rekening';

const ACCOUNTS_LOOP_SELECTOR =
  '#transactionAccountSelection > table > tbody > tr > td:nth-child(2) > div > div.accountSelectMultilineList.default > ul > li';

const SUMMARY_DOWNLOAD_SECTION_SELECTOR = '#downloaden';

const SUMMARY_SINCE_LAST_DOWNLOAD_SELECTOR = '#downloadtype';

const SUMMARY_DOWNLOAD_BUTTON_SELECTOR = '#downloadenFinal';

@injectable()
export class ASNTransactionDownloader {
  public async downloadTransactions(): Promise<string[]> {
    console.log('Started downloading ASN BANK transactions');

    try {
      fs.rmdirSync(CSV_DOWNLOAD_URL);
    } catch (error) {
      // ignore error
    }

    const browser = await puppeteer.launch(options);

    const page = await browser.newPage();

    // @ts-expect-error _client is not available publicly
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: CSV_DOWNLOAD_URL,
    });

    await page.goto(ASN_BANK_LOGIN_URL);

    await page.click(QR_CODE_SELECTOR);

    await util.promisify(setTimeout)(10000);

    await page.goto(TRANSACTION_SUMMARY_URL);

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

    const transactionExports = fs.readdirSync(CSV_DOWNLOAD_URL);

    console.log('Finished downloading ASN transactions');

    return transactionExports.map(url => {
      return path.join(CSV_DOWNLOAD_URL, url);
    });
  }
}
