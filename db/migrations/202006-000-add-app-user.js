/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Run `npx babel-node db/migrations/202006-000-add-app-user.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import getIndexName from '../../util/getIndexName';
import indexSetting from '../../util/indexSetting';
import { users, apps } from '../../schema';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

/**
 * Add new indices categories and articlecategoryfeedbacks
 */
async function addNewIndices() {
  const schemas = { apps };
  for (let [key, schema] of Object.entries(schemas)) {
    const indexName = getIndexName(key);
    const result = await client.indices
      .create({
        index: indexName,
        body: {
          settings: indexSetting,
          mappings: { doc: schema },
          aliases: {
            [key]: {},
          },
        },
      })
      .catch(e => console.error(e));
    console.log(`Index "${key}" created with mappings`, result);
  }
}

/**
 * Add new mapping to users
 */
async function addNewMappings() {
  const { lastActiveAt, appUserId, appId } = users.properties;
  const result = await client.indices
    .putMapping({
      index: getIndexName('users'),
      type: 'doc',
      body: {
        properties: {
          lastActiveAt,
          appUserId,
          appId,
        },
      },
    })
    .catch(e => console.error(e));
  console.log('Mapping added', result);
}

async function main() {
  await addNewIndices();
  await addNewMappings();
}

main();
