import '../../util/catchUnhandledRejection';
import config from 'config';
import elasticsearch from 'elasticsearch';

import getIndexName from '../../util/getIndexName';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'trace',
});
const quietClient = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
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

  const { hits, _scroll_id } = await quietClient.search({
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
    const { hits, _scroll_id } = await quietClient.scroll({
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

  //
  // Collecting foreign keys from legacy docs
  //

  const requestIdToArticleId = {};
  const connectionIdToArticleId = {};
  (await fetchAllDocs('articles_legacy')).forEach(
    ({ _id, _source: { replyConnectionIds, replyRequestIds } }) => {
      replyConnectionIds.forEach(
        connId => (connectionIdToArticleId[connId] = _id)
      );
      replyRequestIds.forEach(reqId => (requestIdToArticleId[reqId] = _id));
    }
  );

  const feedbackIdToScore = {};
  (await fetchAllDocs('replyconnectionfeedbacks_legacy')).forEach(
    ({ _id, _source: { score } }) => {
      feedbackIdToScore[_id] = score;
    }
  );

  const articleIdToConnections = {};
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

      if (!articleIdToConnections[articleId]) {
        articleIdToConnections[articleId] = [];
      }

      articleIdToConnections[articleId].push({
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
  Object.keys(articleIdToConnections).forEach(articleId => {
    operations.push({
      update: {
        _index: getIndexName('articles'),
        _type: 'doc',
        _id: articleId,
      },
    });
    operations.push({
      doc: { articleReplies: articleIdToConnections[articleId] },
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

  const result = await quietClient.bulk({
    body: operations,
    refresh: true,
    _source: false,
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
