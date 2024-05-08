import path from 'path';
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
  requestTimeout: 30 * 60 * 1000, // 30 min
});

const INDEX_NAME = process.argv[2];

if (!INDEX_NAME) {
  console.error('Usage: npm run reload -- <schema-file-name-without-js>');
  process.exit(1);
}

let INDEX_MAPPING;

try {
  const indexMapping = require(path.resolve(
    __dirname,
    `../schema/${INDEX_NAME}`
  ));
  INDEX_MAPPING = indexMapping.default;
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.error(
      `There is no "${INDEX_NAME}.js" or "${INDEX_NAME}.ts" under schema directory.`
    );
    process.exit(1);
  }

  // Unexpected error, re-throw
  throw e;
}

/**
 * @returns {Promise<undefined>}
 */
async function getExistingAlias() {
  const { error, body: currentIndexAliasMappings } =
    await client.indices.getAlias({ name: INDEX_NAME });

  if (error) {
    throw error;
  }

  const realIndexNames = Object.keys(currentIndexAliasMappings);
  if (realIndexNames.length !== 1) {
    throw Error(
      `getExistingAlias: ${INDEX_NAME} has no aliases, or has more than 1 aliases: ${realIndexNames}`
    );
  }

  const realIndexName = realIndexNames[0];
  const newIndexName = getIndexName(INDEX_NAME);
  if (realIndexName === newIndexName) {
    throw new Error(
      `${newIndexName} already exists in current DB, abort operation.\nPlease bump VERSION in schema file, or remove the target index manually.`
    );
  }

  return realIndexName;
}

async function createNewIndex() {
  const indexName = getIndexName(INDEX_NAME);

  return client.indices.create({
    index: indexName,
    body: {
      settings: indexSetting,
      mappings: { doc: INDEX_MAPPING },
    },
  });
}

function reindexExistingIndex(from, to) {
  return client.reindex({
    waitForCompletion: true,
    body: {
      source: { index: from },
      dest: {
        index: to,
        type: 'doc',
        op_type: 'create',
      },
      conflicts: 'proceed',
    },
  });
}

/**
 * Switch alias to new index and remove old indexes in one go.
 *
 * Reference: https://www.elastic.co/guide/en/elasticsearch/reference/6.2/indices-aliases.html
 *
 * @returns {Promise<object>}
 */
function switchAndRemoveOldAlias(oldIndexName) {
  return client.indices.updateAliases({
    body: {
      actions: [
        { add: { index: getIndexName(INDEX_NAME), alias: INDEX_NAME } },
        { remove_index: { index: oldIndexName } },
      ],
    },
  });
}

/**
 * Main script
 */
async function main() {
  const existingAlias = await getExistingAlias();
  console.log('Source: ', existingAlias);

  const { body: createResult } = await createNewIndex();
  console.log('Target: ', createResult.index);

  const { body: reindexResult } = await reindexExistingIndex(
    existingAlias,
    createResult.index
  );
  console.log(
    `Reindexed from ${existingAlias} to ${createResult.index} in ${Math.round(
      reindexResult.took / 1000
    )} seconds.`
  );

  await switchAndRemoveOldAlias(existingAlias);
  console.log(
    `Setup ${createResult.index} -> ${INDEX_NAME} alias and remove ${existingAlias}.`
  );
}

main().catch(console.error);
