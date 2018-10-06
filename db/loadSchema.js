/*eslint import/namespace: ['error', { allowComputed: true }]*/
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from 'elasticsearch';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: 'trace',
});

Object.keys(schema).forEach(index => {
  const indexName = getIndexName(index);

  client.indices
    .create({
      index: indexName,
      body: {
        settings: indexSetting,
        mappings: { doc: schema[index] },
        aliases: {
          [index]: {},
        },
      },
    })
    .then(() => {
      console.log(`Index "${index}" created with mappings`);
    });
});
