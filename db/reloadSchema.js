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
  console.error('Usage: npm run reload <schema-file-name>');
  process.exit(1);
}
const { default: index, VERSION } = require(path.resolve(
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
  if (realIndexName === getIndexName(INDEX_NAME)) {
    throw new Error(
      `${newIndexName} already exists in current DB, abort operation.\nPlease bump VERSION in schema file.`
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
        mappings: { doc: schema[alias] },
      },
    })
    .catch(e => {
      // Ignore already-exist errors.
      // They might be error in previous runs, and they are not linked with alias yet.
      if (e.body && e.body.error.type === 'resource_already_exists_exception')
        return;

      throw e;
    })
    .then(() => {
      console.log(`Index "${indexName}" created with mappings`);
    });
}

function reindexExistingIndex() {
  return Promise.all(
    aliasNames.map(alias => {
      return client.reindex({
        waitForCompletion: true,
        body: {
          source: { index: INDEX_NAME },
          dest: {
            index: getIndexName(alias),
            type: 'doc',
            op_type: 'create',
          },
          conflicts: 'proceed',
        },
      });
    })
  );
}

/**
 * Switch alias to new index and remove old indexes in one go.
 *
 * Reference: https://www.elastic.co/guide/en/elasticsearch/reference/6.2/indices-aliases.html
 *
 * @returns {Promise<object>}
 */
function switchAndRemoveOldAlias() {
  const actions = aliasNames.reduce((actions, alias) => {
    const newActions = [
      {
        add: { index: getIndexName(alias), alias },
      },
    ];
    const oldIndexName = aliasToOldIndexMap[alias];
    if (oldIndexName)
      newActions.push({
        remove_index: { index: oldIndexName },
      });

    return actions.concat(newActions);
  }, []);

  return client.indices.updateAliases({ body: { actions } });
}

/**
 * Main script
 */
async function main() {
  const existingAlias = await getExistingAlias();
  console.log(`Reloading ${existingAlias} to `);
}

main();
