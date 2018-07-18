/*eslint import/namespace: ['error', { allowComputed: true }]*/

import config from 'config';
import elasticsearch from 'elasticsearch';
import '../util/catchUnhandledRejection';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
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
