import * as t from 'io-ts';
import { ResolveLater } from '@/utils/promise';
import { MasterPool } from 'rethinkdb-ts';

export const DefaultDatabase = 'MeteorNet_Core';

export type Constructible = { new (...args: any[]): {} };

export type IndexType =
  | {
      multi?: boolean;
      geo?: boolean;
      raw?: any;
    }
  | string[];

export interface TableRegisterOptions {
  name: string;
  global?: boolean;
  index?: {
    [name: string]: IndexType;
  };
}

export interface LocalizedOptions {}

export interface DataPropertiesOptions {
  rawName?: string;
}

export interface IndexOptions {
  primary?: boolean;
}

export interface Field {
  name: string;
  meta?: FieldMetadata;
}

export interface FieldMetadata {
  localized?: LocalizedOptions;
  typecheck?: t.Type<any>;
  properties?: DataPropertiesOptions;
  index?: IndexOptions;
}

export const [databaseReady, databaseReadyTrigger] = ResolveLater<MasterPool>();
