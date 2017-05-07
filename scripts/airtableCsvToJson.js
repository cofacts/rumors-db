/* eslint no-await-in-loop: off */
import { readFileSync, writeFileSync } from 'fs';

import parse from 'csv-parse/lib/sync';
import ProgressBar from 'progress';
import moment from 'moment';
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
  console.log(
    'Usage: babel-node scripts/airtableCsvToJson.js <PATH_TO_CSV_FILE>'
  );
  process.exit(1);
}

async function aggregateRowsToDocs(rows) {
  const rumorsDB = new DistanceDB(0.6, 0.4);
  const answersDB = new DistanceDB(0.7, 0.4);
  const replyRequestsByIds = {};
  const replyConnectionsByIds = {};

  const bar = new ProgressBar('Aggregating Rows :bar', { total: rows.length });

  for (const record of rows) {
    let rumor;
    const rumorText = record['Rumor Text'];
    const receivedDate = moment(record['Received Date'], 'YYYY年MM月DD日 HH:mm');
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
        createdAt: receivedDate,
        updatedAt: receivedDate,
        references: [{ type: 'LINE', createdAt: receivedDate }],
        userId: '',
        appId: 'BOT_LEGACY',
      };
      rumorsDB.add(rumorText, rumor);
    }

    const replyRequest = {
      id: `${record['Message ID']}-replyRequest`,
      _parent: rumor.id,
      userId: '',
      appId: 'BOT_LEGACY',
      createdAt: receivedDate,
    };

    if (!replyRequestsByIds[replyRequest.id]) {
      replyRequestsByIds[replyRequest.id] = replyRequest;
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
          versions: [
            {
              type: TO_REPLY_TYPE[record.Type] || 'RUMOR', // some editors forgot to write type...
              text: record.Answer,
              reference: record.Reference,
              createdAt: receivedDate,
            },
          ],
        };
        answersDB.add(answerText, answer);
      }

      const replyConnection = {
        id: `${rumor.id}__${answer.id}`,
        _parent: rumor.id,
        replyId: answer.id,
        userId: '',
        appId: 'BOT_LEGACY',
        createdAt: receivedDate,
        updatedAt: receivedDate,
        currentReply: answer.versions[0],
        segment: rumorText,
        segmentRange: { gte: 0, lte: rumorText.length - 1 },
        status: 'NORMAL',
      };

      if (!replyConnectionsByIds[replyConnection.id]) {
        replyConnectionsByIds[replyConnection.id] = replyConnection;
      }
    }

    bar.tick();
  }

  return {
    rumors: rumorsDB.payloads,
    answers: answersDB.payloads,
    replyRequests: Object.keys(replyRequestsByIds).map(
      k => replyRequestsByIds[k]
    ),
    replyConnections: Object.keys(replyConnectionsByIds).map(
      k => replyConnectionsByIds[k]
    ),
  };
}

aggregateRowsToDocs(records).then(data => {
  writeFileSync(outFile, JSON.stringify(data, null, '  '));
});
