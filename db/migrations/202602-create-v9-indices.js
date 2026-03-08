/**
 * Creates destination indices with -v9 suffix and correct mappings for Reindex V6 -> V9.
 * Run this before running reindex in migration.sh so that string fields (status, userId, etc.)
 * are keyword, not text.
 *
 * How to use:
 *  1. Set ELASTICSEARCH_URL in .env to your V9 cluster (e.g. http://localhost:62223)
 *  2. Run: npx babel-node db/migrations/202602-create-v9-indices.js
 *  Or just: ELASTICSEARCH_URL="http://localhost:62223" npx babel-node --extensions .ts,.js db/migrations/202602-create-v9-indices.js
 */

/* eslint import/namespace: ['error', { allowComputed: true }] */
import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import { Client } from '@elastic/elasticsearch';
import getIndexName from '../../util/getIndexName';
import indexSetting from '../../util/indexSetting';

import * as schema from '../../schema';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

async function createV9Indices() {
  const schemaNames = Object.keys(schema).filter((k) => typeof schema[k] === 'object' && schema[k].properties);
  for (const index of schemaNames) {
    const baseName = getIndexName(index);
    const indexName = `${baseName}-v9`;
    try {
      const exists = await client.indices.exists({ index: indexName });
      if (exists) {
        const aliasRes = await client.indices.getAlias({ name: index }).catch(() => ({}));
        const aliasMapping = aliasRes && aliasRes.body !== undefined ? aliasRes.body : aliasRes || {};
        const indicesWithAlias = typeof aliasMapping === 'object' && aliasMapping !== null ? Object.keys(aliasMapping) : [];
        const actions = [];
        indicesWithAlias.forEach((idx) => {
          if (idx !== indexName) actions.push({ remove: { index: idx, alias: index } });
        });
        if (!indicesWithAlias.includes(indexName)) {
          actions.push({ add: { index: indexName, alias: index } });
        }
        if (actions.length > 0) {
          await client.indices.updateAliases({ body: { actions } });
          console.log(`Index "${indexName}" alias "${index}" updated`);
        } else {
          console.log(`Index "${indexName}" already exists with alias "${index}", skip`);
        }
        continue;
      }
      await client.indices.create({
        index: indexName,
        body: {
          settings: indexSetting,
          mappings: schema[index],
          aliases: { [index]: {} },
        },
      });
      console.log(`Index "${indexName}" created with mappings and alias "${index}"`);
    } catch (e) {
      console.error(`Error creating index "${indexName}"`, e);
      throw e;
    }
  }
}

createV9Indices().catch((e) => {
  console.error('[createV9Indices]', e);
  process.exit(1);
});
