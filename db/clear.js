import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

client.indices.delete({ index: '_all' }).then(() => {
  console.log(`All indices has been deleted.`);
});
