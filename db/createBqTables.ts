/**
 * BigQuery client and schema
 */

import { BigQuery } from '@google-cloud/bigquery';
import * as bq from '../bq/events';

const bqDataset = new BigQuery().dataset(
  process.env.BIGQUERY_ANALYTICS_DATASET || ''
);

async function loadSchema() {
  await bqDataset.createTable(bq.TABLE, {
    schema: bq.SCHEMA,
    timePartitioning: {
      type: 'MONTH',
      field: 'createdAt',
    },
  });
}

loadSchema().catch(() => {
  process.exit(1);
});

