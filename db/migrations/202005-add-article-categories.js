/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Run `npx babel-node db/migrations/202005-add-article-categories.js`
 */

import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

/**
 * Fix null field for article.articleCategories
 */
async function addArticleCategory() {
  await client
    .updateByQuery({
      index: 'articles',
      type: 'doc',
      body: {
        script: {
          lang: 'painless',
          source: `
            if (ctx._source.articleCategories === null) {
              ctx._source.articleCategories = new ArrayList();
            } else {
              ctx.op = 'noop';
            }
          `,
        },
      },
    })
    .then(resp => console.log(resp))
    .catch(e => console.error(JSON.stringify(e, null, '  ')));
}

async function main() {
  await addArticleCategory();
}

main();
