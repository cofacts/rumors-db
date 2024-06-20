import path from 'path';
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import { Client } from '@elastic/elasticsearch';
import * as schema from '../schema';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

async function loadSeeds(seedMap: Record<string, unknown[]>) {
  const body: unknown[] = [];
  Object.keys(seedMap).forEach((key) => {
    const fixtures = seedMap[key];
    for (const fixture of fixtures) {
      body.push({ index: { _index: key, _type: 'doc' } });
      body.push(fixture);
    }
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
).catch((e) => {
  console.error(e);
  // Elasticsearch transport.js errors
  if (e?.meta?.body) console.error(e.meta.body);
  process.exit(1);
});
