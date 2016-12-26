import config from 'config';
import elasticsearch from 'elasticsearch';
import parse from 'csv-parse/lib/sync';
import { readFileSync } from 'fs';
import { compareTwoStrings } from 'string-similarity';
import ProgressBar from 'progress';

const MIN_SIMILARITY = 0.87; // can't be higher

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

const records = parse(readFileSync('./data/20161226-0900.csv', 'utf-8'), {columns: true})
const {rumors, answers} = aggregateRowsToDocs(records);

writeToElasticSearch('rumors', rumors);
writeToElasticSearch('answers', answers);

function aggregateRowsToDocs(rows) {
  const rumors = []; // rumors docs to return
  const answers = []; // answer docs to return
  const rumorTexts = []; // cached text array. Should be 1-1 mapping to rumors[].
  const answerTexts = []; // cached text array. Should be 1-1 mapping to answers[].

  const bar = new ProgressBar('Aggregating Rows :bar', { total: rows.length })

  records.forEach(function(record) {
    let rumor;
    const rumorText = record['Rumor Text'];
    const rumorIdx = findDuplication(rumorTexts, rumorText);

    if(rumorIdx !== -1) {
      rumor = rumors[rumorIdx];
    } else {
      rumor = {
        id: `${record['Message ID']}-rumor`,
        text: rumorText,
        answerIds: [],
      };
      rumors.push(rumor);
      rumorTexts.push(rumorText);
    }

    if(record['Answer']) {
      const answerText = record['Answer'];
      const answerIdx = findDuplication(answerTexts, answerText);
      let answer;

      if(answerIdx !== -1) {
        answer = answers[answerIdx];
      } else {
        answer = {
          id: `${record['Message ID']}-answer`,
          versions: [{
            text: record['Answer'],
            reference: record['Reference'],
          }],
        };
        answers.push(answer);
        answerTexts.push(answerText);
      }

      rumor.answerIds.push(answer.id);
    }

    bar.tick()
  });

  return {rumors, answers};
}

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

function findDuplication(texts, target) {
  let idx = -1;
  let bestSimilarity = MIN_SIMILARITY;

  texts.forEach((text, i) => {
    const similarity = compareTwoStrings(text, target);
    if(similarity > bestSimilarity) {
      idx = i;
      bestSimilarity = similarity;
    }
  });

  return idx;
}
