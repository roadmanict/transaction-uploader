import {YnabIDMap} from './types';

const config = (name: string): string => {
  const config = process.env[name];
  if (!config) {
    throw new Error(`Config ${name} not found`);
  }

  return config;
};

export const YNAB_ACCESS_TOKEN = config('YNAB_ACCESS_TOKEN');
export const ACCOUNT_YNAB_MAP = config('ACCOUNT_YNAB_MAP');

export const accountsYNABMap: YnabIDMap = {};
ACCOUNT_YNAB_MAP.split('|').forEach(accountYnab => {
  const [asnAccountNumber, ynabAccountID, budgetID] = accountYnab.split(',');

  accountsYNABMap[asnAccountNumber] = {ynabAccountID, budgetID};
});
