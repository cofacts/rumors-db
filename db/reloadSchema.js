import path from 'path';
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
  requestTimeout: 300000, // 5 min
});

const INDEX_NAME = process.argv[1];
if (!INDEX_NAME) {
  console.error('Usage: npm run reload <schema-file-name-without-js>');
  process.exit(1);
}
const { default: INDEX_MAPPING } = require(path.resolve(
  __dirname,
  `../schema/${INDEX_NAME}.js`
));

/**
 * @returns {Promise<undefined>}
 */
async function getExistingAlias() {
  const {
    body: { error, status, ...currentIndexAliasMappings },
  } = await client.indices
    .getAlias({
      name: INDEX_NAME,
      ignoreUnavailable: true, // some aliasNames may be new
    })
    .catch(e => {
      if (!e.body) throw e;

      return e.body;
    });

  console.info('[INFO] Error:', error, `status: ${status}`);

  const realIndexName = currentIndexAliasMappings[INDEX_NAME].aliases[0];
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

  return client.indices
    .create({
      index: indexName,
      body: {
        settings: indexSetting,
        mappings: { doc: INDEX_MAPPING },
      },
    })
    .catch(e => {
      // Ignore already-exist errors.
      // They might be error in previous runs, and they are not linked with alias yet.
      if (e.body && e.body.error.type === 'resource_already_exists_exception')
        return;

      throw e;
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

  const createResult = await createNewIndex();
  console.log('Target: ', createResult.body.index);

  const reindexResult = await reindexExistingIndex(
    existingAlias,
    createResult.body.index
  );
  console.log(
    `Reindexed from ${existingAlias} to ${createResult.body.index} in ${
      reindexResult.took
    } milliseconds.`
  );

  const removeResult = await switchAndRemoveOldAlias(existingAlias);
  console.log(
    `Updated ${removeResult.body.updated} index alias and removed ${
      removeResult.body.deleted
    } index (${existingAlias}).`
  );
}

main();
