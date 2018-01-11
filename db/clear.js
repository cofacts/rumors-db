import config from 'config';
import elasticsearch from 'elasticsearch';
import '../util/catchUnhandledRejection';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

client.indices.delete({ index: '_all' }).then(() => {
  console.log(`All indices has been deleted.`);
});
