/**
 * BigQuery client and schema
 */
import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';
import * as bq from '../bq/events';

const bqDataset = new BigQuery().dataset(
  process.env.BIGQUERY_ANALYTICS_DATASET || ''
);

async function loadSchema() {
  const [table] = await bqDataset.createTable(bq.TABLE, {
    schema: bq.SCHEMA,
    timePartitioning: {
      type: 'MONTH',
      field: 'createdAt',
    },
  });

  console.log(`Table ${table.id} created under dataset ${table.dataset.id}.`);
  console.log('You may need to wait up to 2 minutes before seeing it in GCS console.');
}

loadSchema().catch((e) => {
  console.error('[createBqTables]', e);
  process.exit(1);
});
