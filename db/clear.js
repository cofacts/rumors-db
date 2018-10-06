import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from 'elasticsearch';

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: 'trace',
});

client.indices.delete({ index: '_all' }).then(() => {
  console.log(`All indices has been deleted.`);
});
