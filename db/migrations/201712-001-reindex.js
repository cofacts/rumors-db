import config from 'config';
import elasticsearch from 'elasticsearch';

import getIndexName from '../../util/getIndexName';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

client.reindex({
  waitForCompletion: true,
  body: {
    source: { index: 'articles_legacy' },
    dest: {
      index: getIndexName('articles'),
      type: 'doc',
      op_type: 'create',
    },
    conflicts: 'proceed',
    script: {
      lang: 'painless',
      source: `
        ctx._source.put('articleReplies', new ArrayList());
        ctx._source.put('hyperlinks', new ArrayList());
        ctx._source.put('tags', new ArrayList());
        ctx._source.put('replyRequestCount', ctx._source.replyRequestIds.size());

        ctx._source.put('app_id', ctx._source.from);
        ctx._source.remove('from');
      `,
    },
  },
});
