/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Reindex the following indexes using `npm run reload -- <index name>`:
 *     articlecategoryfeedbacks, articlereplyfeedbacks, replyrequests, users
 *  4. Run `npx babel-node db/migrations/202110-fill-statuses.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

const INDEXES = [
  'articlecategoryfeedbacks',
  'articlereplyfeedbacks',
  'replyrequests',
];

async function main() {
  for (let index of INDEXES) {
    console.log('Filling default status for index', index);
    console.time(index);
    const resp = await client.updateByQuery({
      index,
      type: 'doc',
      refresh: true,
      conflicts: 'proceed',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.status = 'NORMAL';
          `,
        },
      },
    });
    console.timeEnd(index);
    console.log(index, 'result', resp.body);
    console.log('---------');
  }
}

main().catch(console.error);
