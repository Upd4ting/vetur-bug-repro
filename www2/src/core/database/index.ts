import { Detour } from '@/utils/promise';
import { r } from 'rethinkdb-ts';

import { DefaultDatabase, databaseReadyTrigger } from './def';
import { TableData, Localized, TypeCheck, DataProperties, Index, RegisterTable } from './table';
import Namespace from './namespace';

export function initializeDB() {
  return r
    .connectPool({
      host: 'db-proxy',
      port: 28015,
      password: 'secret',
    })
    .then(async (pool) => {
      if (!(await r.dbList().run()).includes(DefaultDatabase)) {
        await r.dbCreate(DefaultDatabase).run();
      }
      return pool;
    })
    .then(Detour(databaseReadyTrigger));
}

export { Localized, TypeCheck, DataProperties, Index, RegisterTable };
export { Namespace, TableData };
