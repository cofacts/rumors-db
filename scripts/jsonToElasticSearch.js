import config from 'config';
import elasticsearch from 'elasticsearch';
import { readFileSync } from 'fs';

import '../util/catchUnhandledRejection';

if (process.argv.length !== 3) {
  console.log(
    'Usage: babel-node scripts/jsonToElasticSearch.js <PATH_TO_CSV_FILE>'
  );
  process.exit(1);
}

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'info',
});

function writeToElasticSearch(indexName, records) {
  const body = [];

  records.forEach(({ id, _parent, ...doc }) => {
    // action description
    const index = { _index: indexName, _type: 'basic', _id: id };
    if (_parent) index._parent = _parent;
    body.push({ index });
    // document
    body.push(doc);
  });

  console.log(`Writing ${records.length} document(s) to index ${indexName}...`);

  return client.bulk({
    body,
  });
}

const {
  rumors,
  answers,
  replyRequests = [],
  replyConnections = [],
} = JSON.parse(readFileSync(process.argv[2]));
writeToElasticSearch(
  'articles',
  rumors.map(article => {
    // Old JSONs don't have references and replyIds.
    //
    article.references = article.references || [{ type: 'LINE' }];
    article.replyConnectionIds =
      article.replyConnectionIds || article.replyIds || article.answerIds;
    delete article.answerIds;
    return article;
  })
);
writeToElasticSearch(
  'replies',
  answers.map(reply => {
    reply.versions[0].type = reply.versions[0].type || 'RUMOR';
    return reply;
  })
);
writeToElasticSearch('replyrequests', replyRequests);
writeToElasticSearch('replyconnections', replyConnections);
