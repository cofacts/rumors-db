/**
 * Scans the whole index and output documents that does not match current schema.
 */

import path from 'path';
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import { Client } from '@elastic/elasticsearch';
import getAllDocs from '../util/getAllDocs';
import { ZodObject, ZodRawShape } from 'zod';
import * as allSchema from '../schema';

const MAX_ERROR = 25;

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  requestTimeout: 30 * 60 * 1000, // 30 min
});

async function scanIndex(indexName: string) {
  let schema: ZodObject<ZodRawShape> | undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const indexMapping = require(path.resolve(
      __dirname,
      `../schema/${indexName}`
    ));

    schema = indexMapping.schema;
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
      console.error(
        `There is no "${indexName}.js" or "${indexName}.ts" under schema directory.`
      );
    }

    // Re-throw
    throw e;
  }

  if (!schema) return;

  const {
    body: { count },
  } = await client.count({
    index: indexName,
    body: {
      query: {
        match_all: {},
      },
    },
  });
  console.info(`Total docs in index ${indexName}: ${count}`);

  let processedCount = 0;
  let errorCount = 0;
  for await (const { _source: doc, _id } of getAllDocs(client, indexName)) {
    const parseResult = schema.safeParse(doc);
    if (!parseResult.success) {
      console.error(
        `Doc ${_id} does not match schema: ${parseResult.error.message}`
      );
      errorCount += 1;
      if (errorCount >= MAX_ERROR) {
        break;
      }
    }

    processedCount += 1;
    if (processedCount % 1000 === 0) {
      console.log(`Processed ${processedCount} / ${count}`);
    }
  }
  console.info(errorCount === 0 ? 'Done' : `Exited with ${errorCount} errors`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Execute main when called from CLI
async function main() {
  const INDEX_NAME = process.argv[2];
  const indexNames: string[] = [];

  if (INDEX_NAME) {
    indexNames.push(INDEX_NAME);
  } else {
    console.info('Scanning all indexes');
    indexNames.push(...Object.keys(allSchema));
  }

  for (const indexName of indexNames) {
    await scanIndex(indexName);
  }
}
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
