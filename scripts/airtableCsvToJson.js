/* eslint no-await-in-loop: off */
import { readFileSync, writeFileSync } from 'fs';

import parse from 'csv-parse/lib/sync';
import ProgressBar from 'progress';
import DistanceDB from './DistanceDB';
import '../util/catchUnhandledRejection';

const inFile = process.argv[2];
const outFile = inFile.replace(/.csv$/, '.json');

const records = parse(readFileSync(inFile, 'utf-8'), { columns: true });

const TO_REPLY_TYPE = {
  'Rumor sample': 'RUMOR',
  'Non-rumor sample': 'NOT_RUMOR',
  "Don't use": 'NOT_ARTICLE',
};

if (process.argv.length !== 3) {
  console.log('Usage: babel-node scripts/airtableCsvToJson.js <PATH_TO_CSV_FILE>');
  process.exit(1);
}

async function aggregateRowsToDocs(rows) {
  const rumorsDB = new DistanceDB(0.6, 0.4);
  const answersDB = new DistanceDB(0.7, 0.4);
  const replyRequestsByIds = {};

  const bar = new ProgressBar('Aggregating Rows :bar', { total: rows.length });

  for (const record of rows) {
    let rumor;
    const rumorText = record['Rumor Text'];
    const entry = await rumorsDB.findDuplication(rumorText);

    if (entry) {
      rumor = entry;
      if (entry.text.length < rumorText.length) {
        // This new rumor is longer, replace the old rumor text
        rumor.text = rumorText;
      }
    } else {
      rumor = {
        id: `${record['Message ID']}-rumor`,
        text: rumorText,
        replyIds: [],
        replyRequestIds: [],
        createdAt: record['Received Date'],
        updatedAt: record['Received Date'],
        references: [{ type: 'LINE', createdAt: record['Received Date'] }],
      };
      rumorsDB.add(rumorText, rumor);
    }

    const replyRequest = {
      id: `${record['Message ID']}-replyRequest`,
      userId: '',
      from: 'BOT_LEGACY',
      createdAt: record['Received Date'],
    };

    if (!replyRequestsByIds[replyRequest.id]) {
      replyRequestsByIds[replyRequest.id] = replyRequest;
      rumor.replyRequestIds.push(replyRequest.id);
    }

    if (record.Answer) {
      const answerText = record.Answer;
      const answerEntry = await answersDB.findDuplication(answerText);
      let answer;

      if (answerEntry) {
        answer = answerEntry;
      } else {
        answer = {
          id: `${record['Message ID']}-answer`,
          versions: [{
            type: TO_REPLY_TYPE[record.Type] || 'RUMOR', // some editors forgot to write type...
            text: record.Answer,
            reference: record.Reference,
            createdAt: record['Received Date'],
          }],
        };
        answersDB.add(answerText, answer);
      }

      rumor.replyIds.push(answer.id);
    }

    bar.tick();
  }

  return {
    rumors: rumorsDB.payloads,
    answers: answersDB.payloads,
    replyRequests: Object.keys(replyRequestsByIds).map(k => replyRequestsByIds[k]),
  };
}


aggregateRowsToDocs(records).then((data) => {
  writeFileSync(outFile, JSON.stringify(data));
});
