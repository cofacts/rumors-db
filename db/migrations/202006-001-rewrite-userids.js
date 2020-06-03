/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Run `npx babel-node db/migrations/202006-001-rewrite-userids.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import crypto from 'crypto';
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

const BATCH_SIZE = 100;
const SCROLL_TIMEOUT = '30s';

/**
 * Utils from rumors-api
 */
/**
 * @param {string} appId - app ID
 * @param {string} rawUserId - raw user ID given by an backend app
 * @returns {string} the user ID in `users` index if rumors-db
 */
function getBackendAppUserIdInDb(appId, rawUserId) {
  const hash = crypto.createHash('sha256');
  hash.update(`${appId}|${rawUserId}`);
  return hash.digest('base64');
}

/**
 * Fetches all docs in the specified index.
 *
 * @param {String} indexName The name of the index to fetch
 * @yields {Object} the document
 */
async function* getAllDocs(indexName) {
  let resp = await client.search({
    index: indexName,
    scroll: SCROLL_TIMEOUT,
    size: BATCH_SIZE,
    body: {
      query: {
        match_all: {},
      },
    },
  });

  while (true) {
    const docs = resp.body.hits.hits;
    if (docs.length === 0) break;

    for (const doc of docs) {
      yield doc;
    }

    if (!resp.body._scroll_id) {
      break;
    }

    resp = await client.scroll({
      scroll: SCROLL_TIMEOUT,
      scrollId: resp.body._scroll_id,
    });
  }
}

class Bulk {
  _operations = [];

  push(...args) {
    this._operations.push(...args);
    if (this._operations.length >= BATCH_SIZE) {
      this.flush();
    }

    return this;
  }

  async flush() {
    // Clean up _operations now
    const op = this._operations;
    this._operations = [];

    const { body } = await client.bulk({
      body: op,
    });
    if (body.errors) {
      console.error(body.errors);
    } else {
      console.info(
        'Bulk operations complete:',

        // Count each results
        body.items.reduce((results, { result }) => {
          if (results[result] === undefined) results[result] = 0;
          results[result] += 1;
        }, {})
      );
    }

    return this;
  }
}

const bulk = new Bulk();

async function rewriteUserIdsInReplyRequests() {
  for await (const doc of getAllDocs('replyrequests')) {
    const backendAppUserId = getBackendAppUserIdInDb(doc.appId, doc.userId);
    bulk.push(
      {
        delete: {
          _index: 'replyrequests',
          _type: 'doc',
          _id: doc._id,
        },
      },
      {
        index: {
          _index: 'replyrequests',
          _type: 'doc',
          _id: `${doc.articleId}__${backendAppUserId}`,
        },
      }
    );
  }
}

async function rewriteUserIdsInArticles() {
  for await (const doc of getAllDocs('articles')) {
    bulk.push(
      {
        update: {
          _index: 'articles',
          _type: 'doc',
          _id: doc._id,
        },
      },
      {
        doc: {
          references: [],
        },
      }
    );
  }
}

async function main() {
  await rewriteUserIdsInArticles();
  await rewriteUserIdsInReplyRequests();
}

main();
