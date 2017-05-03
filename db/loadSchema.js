/*eslint import/namespace: ['error', { allowComputed: true }]*/

import config from 'config';
import elasticsearch from 'elasticsearch';
import '../util/catchUnhandledRejection';

import * as schema from '../schema';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

Object.keys(schema).forEach(index => {
  client.indices
    .create({
      index,
      body: {
        settings: {
          number_of_shards: 1,
          index: {
            analysis: {
              filter: {
                english_stop: {
                  type: 'stop',
                  stopwords: '_english_',
                },
              },
              analyzer: {
                cjk_url_email: {
                  tokenizer: 'uax_url_email',
                  filter: [
                    'cjk_width',
                    'lowercase',
                    'cjk_bigram',
                    'english_stop',
                  ],
                },
              },
            },
          },
        },
        mappings: { basic: schema[index] },
      },
    })
    .then(() => {
      console.log(`Index "${index}" created with mappings`);
    });
});
