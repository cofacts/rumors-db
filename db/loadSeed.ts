import path from 'path';
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import * as schema from '../schema';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

async function loadSeeds(seedMap: Record<string, unknown[]>) {
  const body: unknown[] = [];
  const indexes = new Set();
  Object.keys(seedMap).forEach((key) => {
    const [, _index, _id] = key.split('/');
    body.push({ index: { _index, _type: 'doc', _id } });
    body.push(seedMap[key]);
    indexes.add(_index);
  });

  const { body: result } = await client.bulk({ body, refresh: 'true' });
  if (result.errors) {
    throw new Error(`Seed load failed : ${JSON.stringify(result, null, '  ')}`);
  }
}

loadSeeds(
  Object.fromEntries(
    Object.keys(schema).map((indexName) => [
      indexName,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(path.resolve(__dirname, `../schema/${indexName}`)).examples,
    ])
  )
);
