import { r, RTable } from 'rethinkdb-ts';
import * as t from 'io-ts';
import { assert } from 'console';
import 'reflect-metadata';

import {
  DefaultDatabase,
  Constructible,
  TableRegisterOptions,
  Field,
  IndexType,
  FieldMetadata,
  LocalizedOptions,
  DataPropertiesOptions,
  IndexOptions,
  databaseReady,
} from './def';

export class DBTable {
  public readonly primaryKey: string;

  public readonly indices: {
    [name: string]: IndexType;
  };

  public constructor(
    public readonly clazz: Constructible,
    public readonly options: TableRegisterOptions,
    public readonly fields: Field[],
  ) {
    this.primaryKey = 'id';
    this.indices = options.index || {};

    for (const field of fields) {
      if (field.meta?.index) {
        if (field.meta.localized) {
          throw new Error(`Localized field "${field.name}" of "${options.name}" cannot be indexed.`);
        }
        if (field.meta.index.primary) {
          this.indices[this.primaryKey] = {};
          this.primaryKey = field.name;
        } else {
          this.indices[field.name] = {};
        }
      }
    }
  }

  public get name() {
    return this.options.name;
  }

  public create(namespace?: string): Promise<any> {
    return r
      .db(namespace || DefaultDatabase)
      .tableCreate(this.name, {
        primaryKey: this.primaryKey,
      })
      .run();
  }

  public inNamespace<T>(namespace: string): RTable<T> {
    return r.db(namespace).table<T>(this.name);
  }

  public async setupIndex(namespace?: string): Promise<void> {
    const indices = await r
      .db(namespace || DefaultDatabase)
      .table(this.name)
      .indexList()
      .run();
    await Promise.all(
      Object.keys(this.indices)
        .filter((index) => !indices.includes(index))
        .map((index) => {
          const dt = this.indices[index];
          let param: any;
          if (Array.isArray(dt)) {
            param = dt.map((field) => r.row(field));
          } else if (dt.raw) {
            param = dt.raw;
          } else {
            param = dt;
          }
          return r
            .db(namespace || DefaultDatabase)
            .table(this.name)
            .indexCreate(index, param)
            .run();
        }),
    );
  }

  extend(newfields: Field[]) {
    for (const newfield of newfields) {
      if (!this.fields.find((field) => field.name === newfield.name)) {
        if (newfield.meta?.index) {
          if (newfield.meta.localized) {
            throw new Error(`Localized field "${newfield.name}" of "${this.name}" cannot be indexed.`);
          }
          this.indices[newfield.name] = {};
        }
        this.fields.push(newfield);
      }
    }
  }
}

export const Tables: DBTable[] = [];

export const MetadataKey = Symbol('TableMetadata');

const ExtendedTables: {
  [name: string]: Field[][];
} = {};

const InitializedNamespaces: string[] = [];

export async function InitializeNamespaceTables(namespace?: string, tables?: DBTable[]) {
  const existing = await r
    .db(namespace || DefaultDatabase)
    .tableList()
    .run();
  if (namespace && !InitializedNamespaces.includes(namespace)) {
    InitializedNamespaces.push(namespace);
  }
  await Promise.all(
    (tables || Tables)
      .filter((table) => !!namespace === !table.options.global)
      .map(async (table) => {
        if (!existing.includes(table.name)) {
          await table.create(namespace);
        }
        await table.setupIndex(namespace);
      }),
  );
}

function DefineTableMetadata(callback: (data: FieldMetadata) => void) {
  return (target: any, propertyKey: string) => {
    const data = Reflect.getMetadata(MetadataKey, target, propertyKey) || {};
    callback(data);
    Reflect.defineMetadata(MetadataKey, data, target, propertyKey);
  };
}

export const Localized = (options?: LocalizedOptions) =>
  DefineTableMetadata((data) => (data.localized = options || {}));
export const TypeCheck = (type: t.Type<any>) => DefineTableMetadata((data) => (data.typecheck = type));
export const DataProperties = (options?: DataPropertiesOptions) =>
  DefineTableMetadata((data) => (data.properties = options));
export const Index = (options?: IndexOptions) => DefineTableMetadata((data) => (data.index = options || {}));

function GetFields<T extends Constructible>(target: T, tname: string) {
  // eslint-disable-next-line new-cap
  const obj = new target();
  return Object.keys(obj).map(
    (key): Field => {
      const meta: FieldMetadata = Reflect.getMetadata(MetadataKey, obj, key);
      const name: string = meta?.properties?.rawName || `${tname}_${key}`;
      return {
        name,
        meta,
      };
    },
  );
}

export function RegisterTable(options: TableRegisterOptions) {
  return <T extends Constructible>(target: T): T => {
    assert(
      !Tables.find((entry) => entry.name === options.name && !entry.options.global === !options.global),
      'Table "%s" is already defined',
      options.name,
    );

    const table = new DBTable(target, options, GetFields(target, options.name));
    Tables.push(table);

    const iname = !!options.global + options.name;
    if (ExtendedTables[iname]) {
      for (const fields of ExtendedTables[iname]) {
        table.extend(fields);
      }
    }

    if (table.options.global) {
      databaseReady.then(() => InitializeNamespaceTables(undefined, [table]));
    } else {
      for (const namespace of InitializedNamespaces) {
        InitializeNamespaceTables(namespace, [table]);
      }
    }

    return target;
  };
}

let globalInitialized = false;
databaseReady.then(() => {
  globalInitialized = true;
});

export function ExtendTable(name: string, global?: boolean) {
  return <T extends Constructible>(target: T): T => {
    const table = Tables.find((entry) => entry.name === name && !entry.options.global === !global);
    if (table) {
      table.extend(GetFields(target, name));
      if (global) {
        if (globalInitialized) {
          table.setupIndex();
        }
      } else {
        for (const namespace of InitializedNamespaces) {
          table.setupIndex(namespace);
        }
      }
    } else {
      const iname = !!global + name;
      ExtendedTables[iname] = ExtendedTables[iname] || [];
      ExtendedTables[iname].push(GetFields(target, name));
    }

    return target;
  };
}

export class TableData {
  @TypeCheck(t.string)
  @DataProperties({ rawName: 'id' })
  public id!: string;

  @DataProperties({ rawName: 'localization' })
  private localization?: {
    [lang: string]: any;
  };

  public localize(lang: string): this {
    if (!this.localization) {
      return this;
    }
    const result: this = new (this.constructor as Constructible)() as this;
    Object.assign(result, this);
    delete result.localization;
    Object.assign(result, this.localization[lang]);
    return result;
  }
}
