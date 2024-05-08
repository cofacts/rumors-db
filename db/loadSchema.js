/*eslint import/namespace: ['error', { allowComputed: true }]*/
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

const INDEX_NAME = process.argv[2];

if (INDEX_NAME && !schema[INDEX_NAME]) {
  console.error(
    `Specified index ${INDEX_NAME} is not exported in schema/index.js.`
  );
  process.exit(1);
}

const SCHEMA_NAMES = INDEX_NAME ? [INDEX_NAME] : Object.keys(schema);

async function loadSchema() {
  for (const index of SCHEMA_NAMES) {
    const indexName = getIndexName(index);
    try {
      await client.indices.create({
        index: indexName,
        body: {
          settings: indexSetting,
          mappings: { doc: schema[index] },
          aliases: {
            [index]: {},
          },
        },
      });
    } catch (e) {
      console.error(`Error creating index "${indexName}"`, e);
      throw e;
    }
    console.log(`Index "${indexName}" created with mappings`);
  }
}

loadSchema().catch((e) => {
  console.error('[loadSchema]', e);
  process.exit(1);
});
