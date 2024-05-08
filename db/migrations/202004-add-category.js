/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Run `npx babel-node db/migrations/202004-add-category.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import getIndexName from '../../util/getIndexName';
import indexSetting from '../../util/indexSetting';
import { categories, articlecategoryfeedbacks, articles } from '../../schema';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

/**
 * Add new indices categories and articlecategoryfeedbacks
 */
async function addNewIndices() {
  const schemas = { categories, articlecategoryfeedbacks };
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
      .catch((e) => console.error(e));
    console.log(`Index "${key}" created with mappings`, result);
  }
}

/**
 * Add new mapping articleCategories and normalArticleCategoryCount to articles
 */
async function addNewMappings() {
  const { articleCategories, normalArticleCategoryCount } = articles.properties;
  const result = await client.indices
    .putMapping({
      index: getIndexName('articles'),
      type: 'doc',
      body: {
        properties: {
          articleCategories,
          normalArticleCategoryCount,
        },
      },
    })
    .catch((e) => console.error(e));
  console.log('Mapping added', result);
}

async function main() {
  await addNewIndices();
  await addNewMappings();
}

main();
