/* eslint no-await-in-loop: off */
import { readFileSync, writeFileSync } from 'fs';

import parse from 'csv-parse/lib/sync';
import ProgressBar from 'progress';
import DistanceDB from './DistanceDB';
import '../util/catchUnhandledRejection';

const inFile = process.argv[2];
const outFile = inFile.replace(/.csv$/, '.json');

const records = parse(readFileSync(inFile, 'utf-8'), { columns: true });

if (process.argv.length !== 3) {
  console.log('Usage: babel-node scripts/airtableCsvToJson.js <PATH_TO_CSV_FILE>');
  process.exit(1);
}

async function aggregateRowsToDocs(rows) {
  const rumorsDB = new DistanceDB(0.7, 0.4);
  const answersDB = new DistanceDB(0.9, 0.7);

  const bar = new ProgressBar('Aggregating Rows :bar', { total: rows.length });

  for (const record of rows) {
    let rumor;
    const rumorText = record['Rumor Text'];
    const entry = await rumorsDB.findDuplication(rumorText);

    if (entry) {
      rumor = entry;
    } else {
      rumor = {
        id: `${record['Message ID']}-rumor`,
        text: rumorText,
        answerIds: [],
      };
      rumorsDB.add(rumorText, rumor);
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
            text: record.Answer,
            reference: record.Reference,
          }],
        };
        answersDB.add(answerText, answer);
      }

      rumor.answerIds.push(answer.id);
    }

    bar.tick();
  }

  return { rumors: rumorsDB.payloads, answers: answersDB.payloads };
}


aggregateRowsToDocs(records).then((data) => {
  writeFileSync(outFile, JSON.stringify(data));
});
