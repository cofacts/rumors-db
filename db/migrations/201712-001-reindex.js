import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from '@elastic/elasticsearch';

import getIndexName from '../../util/getIndexName';

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
});

/**
 * Fetches all docs in the specified index.
 *
 * @param {String} indexName The name of the index to fetch
 * @returns {Array<Docs>} Array of {_id, _source, ...}.
 */
async function fetchAllDocs(indexName) {
  let scrollId,
    docs = [],
    total = Infinity;

  const {
    body: { hits, _scroll_id },
  } = await client.search({
    index: indexName,
    scroll: '5s',
    size: 1000,
    body: {
      query: {
        match_all: {},
      },
    },
  });
  docs = hits.hits;
  total = hits.total;
  scrollId = _scroll_id;

  while (docs.length < total) {
    const {
      body: { hits, _scroll_id },
    } = await client.scroll({
      scroll: '5s',
      scrollId,
    });
    docs = docs.concat(hits.hits);
    scrollId = _scroll_id;
  }

  return docs;
}

/**
 * Turns array of {_id, _source} into a map of _id to _source.
 * @param {Array<Docs>} docs array of {_id, _source}
 * @return {Object} an object with _id as key and respective _source as value.
 */
function createIdToSourceMap(docs) {
  return docs.reduce((agg, { _id, _source }) => {
    agg[_id] = _source;
    return agg;
  }, {});
}

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
          ctx._source.put('normalArticleReplyCount', 0);

          ctx._source.put('replyRequestCount', ctx._source.replyRequestIds.size());
          ctx._source.remove('replyConnectionIds');

          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');

          ctx._source.remove('replyRequestIds');
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
          ctx._source.put('appId', ctx._source.from);
          ctx._source.remove('from');
        `,
      },
    },
  });

  await client.reindex({
    waitForCompletion: true,
    body: {
      source: { index: 'users_legacy' },
      dest: {
        index: getIndexName('users'),
        type: 'doc',
        op_type: 'create',
      },
      conflicts: 'proceed',
    },
  });

  //
  // Collecting foreign keys from legacy docs
  //

  const replyRequestMap = createIdToSourceMap(
    await fetchAllDocs('replyrequests_legacy')
  );

  const requestIdToArticleId = {};
  const articleIdToLastRequest = {};
  const connectionIdToArticleId = {};
  (await fetchAllDocs('articles_legacy')).forEach(
    ({ _id, _source: { replyConnectionIds, replyRequestIds } }) => {
      replyConnectionIds.forEach(
        connId => (connectionIdToArticleId[connId] = _id)
      );
      replyRequestIds.forEach(reqId => (requestIdToArticleId[reqId] = _id));
      articleIdToLastRequest[_id] = replyRequestIds.reduce(
        (lastDate, replyRequestId) => {
          const { createdAt } = replyRequestMap[replyRequestId];
          return lastDate > createdAt ? lastDate : createdAt;
        },
        new Date(0)
      );
    }
  );

  const feedbackIdToScore = {};
  (await fetchAllDocs('replyconnectionfeedbacks_legacy')).forEach(
    ({ _id, _source: { score } }) => {
      feedbackIdToScore[_id] = score;
    }
  );

  const articleIdToArticleReplies = {};
  const feedbackIdToReplyId = {};
  const feedbackIdToArticleId = {};
  const replyMap = createIdToSourceMap(await fetchAllDocs('replies_legacy'));
  (await fetchAllDocs('replyconnections_legacy')).forEach(
    ({
      _id,
      _source: {
        replyId,
        userId,
        from,
        status,
        createdAt,
        updatedAt,
        feedbackIds,
      },
    }) => {
      feedbackIds.forEach(feedbackId => {
        feedbackIdToReplyId[feedbackId] = replyId;
        feedbackIdToArticleId[feedbackId] = connectionIdToArticleId[_id];
      });

      const articleId = connectionIdToArticleId[_id];
      const reply = replyMap[replyId];
      const scores = feedbackIds.map(
        feedbackId => feedbackIdToScore[feedbackId]
      );

      if (!articleIdToArticleReplies[articleId]) {
        articleIdToArticleReplies[articleId] = [];
      }

      articleIdToArticleReplies[articleId].push({
        replyId,
        userId,
        appId: from,
        status: status || 'NORMAL',
        createdAt,
        updatedAt,

        replyType: reply.versions[0].type,
        positiveFeedbackCount: scores.reduce(
          (sum, score) => (sum += score === 1 ? 1 : 0),
          0
        ),
        negativeFeedbackCount: scores.reduce(
          (sum, score) => (sum += score === -1 ? 1 : 0),
          0
        ),
      });
    }
  );

  //
  // Write the foreign key information and articleReplies to new documents
  //

  const operations = [];
  Object.keys(articleIdToArticleReplies).forEach(articleId => {
    const articleReplies = articleIdToArticleReplies[articleId];
    operations.push({
      update: {
        _index: getIndexName('articles'),
        _type: 'doc',
        _id: articleId,
      },
    });
    operations.push({
      doc: {
        articleReplies,
        normalArticleReplyCount: articleReplies.filter(
          ({ status }) => status === 'NORMAL'
        ).length,
      },
    });
  });

  Object.keys(articleIdToLastRequest).forEach(articleId => {
    operations.push({
      update: {
        _index: getIndexName('articles'),
        _type: 'doc',
        _id: articleId,
      },
    });
    operations.push({
      doc: {
        lastRequestedAt: articleIdToLastRequest[articleId],
      },
    });
  });

  Object.keys(requestIdToArticleId).forEach(requestId => {
    const articleId = requestIdToArticleId[requestId];

    operations.push({
      update: {
        _index: getIndexName('replyrequests'),
        _type: 'doc',
        _id: requestId,
      },
    });
    operations.push({
      doc: { articleId },
    });
  });

  Object.keys(feedbackIdToArticleId).forEach(feedbackId => {
    const articleId = feedbackIdToArticleId[feedbackId];
    const replyId = feedbackIdToReplyId[feedbackId];

    operations.push({
      update: {
        _index: getIndexName('articlereplyfeedbacks'),
        _type: 'doc',
        _id: feedbackId,
      },
    });
    operations.push({
      doc: { articleId, replyId },
    });
  });

  console.log('Bulk operation count', operations.length);

  const { body: result } = await client.bulk({
    body: operations,
    refresh: true,
    _source: false,
    timeout: '10m',
    requestTimeout: 600000,
  });
  console.log(
    'Bulk operation done: ',
    `Has errors = ${result.errors}`,
    result.items
      .filter(({ update: { error } }) => error)
      .map(({ update }) => `${update._id} -> ${JSON.stringify(update.error)}`)
  );
}

main();
