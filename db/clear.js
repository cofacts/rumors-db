import '../util/catchUnhandledRejection';
import config from 'config';
import elasticsearch from 'elasticsearch'

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
})

Object.keys(schema).forEach(index => {
  client.indices.delete({
    index,
  }).then(() => {
    console.log(`Index "${index}" deleted.`);
  })
});
