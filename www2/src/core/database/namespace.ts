import * as t from 'io-ts';
import { date } from 'io-ts-types';
import { RegisterTable, TableData, TypeCheck, Index } from './table';

export default class Namespace {
  public readonly db: string;

  constructor(public readonly id: string) {
    this.db = id.replace('-', '_');
  }
}

@RegisterTable({
  name: 't_saas_namespaces',
  global: true,
})
export class Namespaces extends TableData {
  @Index()
  @TypeCheck(t.string)
  label!: string;

  @TypeCheck(t.string)
  description!: string;

  @TypeCheck(date)
  creation!: Date;

  @TypeCheck(t.string)
  parent?: string;
}
