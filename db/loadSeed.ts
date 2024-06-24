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
    fixtures.forEach((fixture, idx) => {
      body.push({
        index: { _index: key, _type: 'doc', _id: `${key}-${idx + 1}` },
      });
      body.push(fixture);
    });
  });

  const { body: result } = await client.bulk({ body, refresh: 'true' });
  const resultStr = JSON.stringify(result, null, '  ');
  if (result.errors) {
    throw new Error(`[loadSeed] Seed load failed ${resultStr}`);
  } else {
    console.info(`[loadSeed] Success`, resultStr);
  }
}

loadSeeds(
  Object.fromEntries(
    Object.keys(schema).map((indexName) => [
      indexName,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(path.resolve(__dirname, `../schema/${indexName}`)).examples ?? [],
    ])
  )
).catch((e) => {
  console.error(e);
  // Elasticsearch transport.js errors
  if (e?.meta?.body) console.error(e.meta.body);
  process.exit(1);
});
