/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Run `npx babel-node db/migrations/202008-add-analytics.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';
import { analytics, users } from '../../schema';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

const schemas = { analytics, users };

/**
 * Add new fields to analytics and users.
 */
async function updateMappings() {
  for (let [index, props] of Object.entries(schemas)) {
    try {
      await client.indices.put_mapping({
        index: index,
        type: 'doc',
        body: props,
      });
    } catch (e) {
      console.error(`Error updating mappings for "${index}"`, e);
      throw e;
    }
    console.log(
      `Index "${index}"' new mappings: ${JSON.stringify(props.properties)}`
    );
  }
}

async function main() {
  await updateMappings();
}

main();
