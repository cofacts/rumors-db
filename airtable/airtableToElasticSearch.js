import '../util/catchUnhandledRejection';
import config from 'config';

import Airtable from 'airtable';
import elasticsearch from 'elasticsearch'

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
})
const base = new Airtable({ apiKey: config.get('AIRTABLE_APIKEY') }).base(config.get('AIRTABLE_BASE'));

function fetchRumors() {
  const data = {
    rumors: [],
    answers: [],
  };

  return new Promise((resolve, reject) => {
    base('Rumors').select({
      view: config.get('AIRTABLE_VIEW'),
    }).eachPage(function page(records, fetchNextPage) {

      // This function (`page`) will get called for each page of records.

      records.forEach(function(record) {
        console.log('Retrieved ', record.get('Message ID'));

        const answer = record.get('Answer');
        const answerIds = []

        if(answer) {
          answerIds.push(`${record.get('Message ID')}-answer`);
        }

        data.rumors.push({
          id: `${record.get('Message ID')}-rumor`,
          text: record.get('Rumor Text'),
          answerIds,
        });

        if(record.get('Answer')) {
          data.answers.push({
            id: answerIds[0],
            versions: [{
              text: record.get('Answer'),
              reference: record.get('Reference'),
            }],
          });
        }
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();

    }, function done(error) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

async function main() {
  const data = await fetchRumors();
  const body = [];

  Object.keys(data).forEach(indexName => {
    data[indexName].forEach(({id, ...doc}) => {
      // action description
      body.push({index: {_index: indexName, _type: 'basic', _id: id}});
      // document
      body.push(doc);
    });
  });

  console.log(await client.bulk({
    body
  }));
}

main();
