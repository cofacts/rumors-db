import { Client } from 'elasticsearch';
import csvStringify from 'csv-stringify';
import fs from 'fs';

const configs = [
  {
    fileName: 'editor_replies_per_week.csv',
    meta: { index: 'replyconnections', type: 'basic' },
    data: {
      aggs: {
        user_counts_over_time: {
          date_histogram: {
            field: 'createdAt',
            interval: 'week',
            format: 'yyyy-MM-dd',
          },
          aggregations: {
            user_counts: {
              cardinality: { field: 'userId' },
            },
          },
        },
      },
      size: 0,
    },
    responsePath: ['aggregations', 'user_counts_over_time', 'buckets'],
    csvFieldPaths: [['key_as_string'], ['doc_count'], ['user_counts', 'value']],
  },
  {
    fileName: 'new_user_per_week.csv',
    meta: { index: 'users', type: 'basic' },
    data: {
      aggs: {
        new_users: {
          date_histogram: {
            field: 'createdAt',
            interval: 'week',
            format: 'yyyy-MM-dd',
          },
        },
      },
      size: 0,
    },
    responsePath: ['aggregations', 'new_users', 'buckets'],
    csvFieldPaths: [['key_as_string'], ['doc_count']],
  },
  {
    fileName: 'new_user_per_day.csv',
    meta: { index: 'users', type: 'basic' },
    data: {
      aggs: {
        new_users: {
          date_histogram: {
            field: 'createdAt',
            interval: 'day',
            format: 'yyyy-MM-dd',
          },
        },
      },
      size: 0,
    },
    responsePath: ['aggregations', 'new_users', 'buckets'],
    csvFieldPaths: [['key_as_string'], ['doc_count']],
  },
  {
    fileName: 'article_created_per_week.csv',
    meta: { index: 'articles', type: 'basic' },
    data: {
      aggs: {
        article_creation_over_time: {
          date_histogram: {
            field: 'createdAt',
            interval: 'week',
            format: 'yyyy-MM-dd',
          },
          aggs: {
            user_counts: {
              cardinality: {
                field: 'userId',
              },
            },
          },
        },
      },
      size: 0,
    },
    responsePath: ['aggregations', 'article_creation_over_time', 'buckets'],
    csvFieldPaths: [['key_as_string'], ['doc_count'], ['user_counts', 'value']],
  },
];

const client = new Client({
  host: process.env.HOST || 'http://localhost:6226',
  httpAuth: 'elastic:changeme',
});

/**
 * Get deeply nested data in the specific fieldPath inside the given data.
 * Similar to ImmutableJS's getIn().
 * @param {Object} data The nested data
 * @param {Array<String>} fieldPath The path to the data to return
 */
function getIn(data, fieldPath) {
  return fieldPath.reduce((current, field) => current[field], data);
}

client
  .msearch({
    body: configs.reduce((body, { meta, data }) => body.concat(meta, data), []),
  })
  .then(({ responses }) =>
    // Process to CSV rows
    //
    responses.map((response, idx) => {
      const { responsePath, csvFieldPaths } = configs[idx];
      const rowsToWrite = getIn(response, responsePath);
      return [csvFieldPaths.map(path => path.join('/'))].concat(
        rowsToWrite.map(rowData =>
          csvFieldPaths.map(path => getIn(rowData, path))
        )
      );
    })
  )
  .then(files =>
    // Stringify to csv
    //
    Promise.all(
      files.map(
        fileData =>
          new Promise((resolve, reject) => {
            csvStringify(fileData, (err, csvData) => {
              if (err) {
                return reject(err);
              }
              return resolve(csvData);
            });
          })
      )
    )
  )
  .then(csvs =>
    // Add filename and save
    //
    Promise.all(
      csvs.map(
        (csv, idx) =>
          new Promise((resolve, reject) => {
            fs.writeFile(`stats/output/${configs[idx].fileName}`, csv, err => {
              if (err) return reject(err);
              resolve();
            });
          })
      )
    )
  )
  .catch(err => console.error(err));
