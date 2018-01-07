import '../../util/catchUnhandledRejection';
import config from 'config';
import elasticsearch from 'elasticsearch';

import getIndexName from '../../util/getIndexName';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});

async function main() {
  await client.reindex({
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

          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');
        `,
      },
    },
  });

  await client.reindex({
    waitForCompletion: true,
    body: {
      source: { index: 'replies_legacy' },
      dest: {
        index: getIndexName('replies'),
        type: 'doc',
        op_type: 'create',
      },
      conflicts: 'proceed',
      script: {
        lang: 'painless',
        source: `
          ctx._source.put('hyperlinks', new ArrayList());

          ctx._source.putAll(ctx._source.versions[0]);
          ctx._source.remove('versions');

          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');
        `,
      },
    },
  });

  await client.reindex({
    waitForCompletion: true,
    body: {
      source: { index: 'replyconnectionfeedbacks_legacy' },
      dest: {
        index: getIndexName('articlereplyfeedbacks'),
        type: 'doc',
        op_type: 'create',
      },
      conflicts: 'proceed',
      script: {
        lang: 'painless',
        source: `
          String[] tokens = /__/.split(ctx._id);
          String articleId = tokens[0];
          String replyId = tokens[1];

          ctx._source.put('articleId', articleId);
          ctx._source.put('replyId', replyId);
          ctx._source.remove('comment');

          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');
        `,
      },
    },
  });

  await client.reindex({
    waitForCompletion: true,
    body: {
      source: { index: 'replyrequests_legacy' },
      dest: {
        index: getIndexName('replyrequests'),
        type: 'doc',
        op_type: 'create',
      },
      conflicts: 'proceed',
      script: {
        lang: 'painless',
        source: `
          String articleId = ctx._source.from.equals('RUMORS_LINE_BOT') ?
            /__/.split(ctx._id)[0] :
            ctx._id.replace('-replyRequest', '-rumor');

          ctx._source.put('articleId', articleId);
          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');
        `,
      },
    },
  });
}

main();
