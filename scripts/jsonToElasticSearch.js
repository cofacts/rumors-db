import '../util/catchUnhandledRejection';

import config from 'config';
import elasticsearch from 'elasticsearch';

import { readFileSync } from 'fs';

if(process.argv.length !== 3) {
  console.log("Usage: babel-node scripts/jsonToElasticSearch.js <PATH_TO_CSV_FILE>");
  process.exit(1);
}

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

const { rumors, answers } = JSON.parse(readFileSync(process.argv[2]));
writeToElasticSearch('articles', rumors);
writeToElasticSearch('replies', answers);

function writeToElasticSearch(indexName, records){
  const body = [];

  records.forEach(({id, ...doc}) => {
    // action description
    body.push({index: {_index: indexName, _type: 'basic', _id: id}});
    // document
    body.push(doc);
  });

  return client.bulk({
    body
  })
}
