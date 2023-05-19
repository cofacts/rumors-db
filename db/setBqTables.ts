/**
 * BigQuery client and schema
 */
import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';
import type { TableSchema } from '@google-cloud/bigquery';
import * as bqEvents from '../bq/events';

const bqDataset = new BigQuery().dataset(
  process.env.BIGQUERY_ANALYTICS_DATASET || ''
);

async function loadSchema({TABLE, SCHEMA}: {TABLE: string, SCHEMA: TableSchema[]}) {
  const table = bqDataset.table(TABLE);

  if(await table.exists()) {
    const [result] = await table.setMetadata({schema: SCHEMA});

    console.log(`Table ${table.id} fields updated to:`, result.schema.fields);
    return;
  }

  const [createdTable] = await bqDataset.createTable(TABLE, {
    schema: SCHEMA,
    timePartitioning: {
      type: 'MONTH',
      field: 'createdAt',
    },
  });

  console.log(`Table ${table.id} created under dataset ${createdTable.dataset.id}.`);
  console.log('You may need to wait up to 2 minutes before seeing it in GCS console.');
}

loadSchema(bqEvents).catch((e) => {
  console.error('[setBqTables]', e);
  process.exit(1);
});
