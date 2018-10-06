/*eslint import/namespace: ['error', { allowComputed: true }]*/
import 'dotenv/config';
import '../util/catchUnhandledRejection';
import elasticsearch from 'elasticsearch';
import getIndexName from '../util/getIndexName';
import indexSetting from '../util/indexSetting';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: 'trace',
  requestTimeout: 300000, // 5 min
});

const aliasNames = Object.keys(schema);

let aliasToOldIndexMap = {};

/**
 * @returns {Promise<undefined>}
 */
async function populateOldIndexMap() {
  // Returns:
  // { replies_v1_0_0: { aliases: { replies: {} } },
  //   articles_v1_0_0: { aliases: { articles: {} } }, ... }

  const { error, status, ...currentIndexAliasMappings } = await client.indices
    .getAlias({
      name: aliasNames,
      ignoreUnavailable: true, // some aliasNames may be new
    })
    .catch(e => {
      if (!e.body) throw e;

      return e.body;
    });

  console.info('[INFO] Error:', error, `status: ${status}`);

  aliasToOldIndexMap = Object.keys(currentIndexAliasMappings).reduce(
    (map, realIndexName) => {
      const alias = Object.keys(
        currentIndexAliasMappings[realIndexName].aliases
      )[0];
      map[alias] = realIndexName;
      return map;
    },
    {}
  );

  // Check if any new index name will collide with existing old indexes.
  // If so, abort operation.
  aliasNames.forEach(alias => {
    const newIndexName = getIndexName(alias);
    if (currentIndexAliasMappings[newIndexName]) {
      throw new Error(
        `${newIndexName} already exists in current DB, abort operation.\nPlease bump version in package.json.`
      );
    }
  });
}

/**
 * @returns {Promise<object[]>}
 */
function createNewIndexes() {
  return Promise.all(
    aliasNames.map(alias => {
      const indexName = getIndexName(alias);

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
          if (
            e.body &&
            e.body.error.type === 'resource_already_exists_exception'
          )
            return;

          throw e;
        })
        .then(() => {
          console.log(`Index "${alias}" created with mappings`);
        });
    })
  );
}

/**
 * @returns {Promise<object[]>}
 */
function reindexExistingIndexes() {
  return Promise.all(
    aliasNames.map(alias => {
      const oldIndexName = aliasToOldIndexMap[alias];
      if (!oldIndexName) return; // new alias that does not exist in DB

      return client.reindex({
        waitForCompletion: true,
        body: {
          source: { index: oldIndexName },
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
function switchAndRemoveAllAliases() {
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
Promise.resolve()
  .then(populateOldIndexMap)
  .then(createNewIndexes)
  .then(reindexExistingIndexes)
  .then(switchAndRemoveAllAliases);
