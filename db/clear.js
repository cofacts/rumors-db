import config from 'config';
import elasticsearch from 'elasticsearch';
import '../util/catchUnhandledRejection';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

Object.keys(schema).forEach(index => {
  const indexName = `${index}_v*`;
  client.indices
    .delete({
      index: indexName,
    })
    .then(() => {
      console.log(`Index "${indexName}" deleted.`);
    });
});
