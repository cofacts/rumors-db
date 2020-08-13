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

async function loadSchema() {
  for (const index of Object.keys(schema)) {
    const indexName = getIndexName(index);
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
    console.log(`Index "${index}" created with mappings`);
  }
}

loadSchema().catch(e => {
  console.error(e);
  process.exit(1);
});
