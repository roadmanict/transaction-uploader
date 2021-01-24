import 'reflect-metadata';
import {container} from 'tsyringe';
import {ASNTransactionDownloader} from '../src/infrastructure/ASNTransactionDownloader';

container.clearInstances();

export const mockContainer = container.registerInstance(
  ASNTransactionDownloader,
  {} as ASNTransactionDownloader
);
