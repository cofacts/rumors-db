import elasticsearch from 'elasticsearch';
import config from 'config';
import csvStringify from 'csv-stringify';
import crypto from 'crypto';

import '../util/catchUnhandledRejection';
import fs from 'fs';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'info',
});

/**
 * @param {any[][]} input
 * @returns {Promise<string>} CSV content
 */
function generateCSV(input) {
  return new Promise((resolve, reject) => {
    csvStringify(input, (err, csvData) => {
      if (err) {
        return reject(err);
      }
      return resolve(csvData);
    });
  });
}

/**
 * @param {string} input
 * @returns {string} - input's sha256 hash hex string. Empty string if input is falsy.
 */
function sha256(input) {
  return input
    ? crypto
        .createHash('sha256')
        .update(input, 'utf8')
        .digest('hex')
    : '';
}

async function scanIndex(index) {
  let result = [];

  const initialResult = await client.search({
    index,
    size: 200,
    scroll: '5m',
  });

  const totalCount = initialResult.hits.total;

  initialResult.hits.hits.forEach(hit => {
    result.push(hit);
  });

  while (result.length < totalCount) {
    const scrollResult = await client.scroll({
      scrollId: initialResult._scroll_id,
      scroll: '5m',
    });
    scrollResult.hits.hits.forEach(hit => {
      result.push(hit);
    });
  }

  return result;
}

async function dumpArticles(articles) {
  const csvString = await generateCSV([
    [
      'id',
      'references', // array of strings
      'userIdsha256',
      'tags', // array of strings
      'normalArticleReplyCount',
      'appId',
      'text',
      'hyperlinks',
      'createdAt',
      'updatedAt',
      'lastRequestedAt',
    ],
    ...articles.map(({ _id, _source }) => [
      _id,
      _source.references.map(ref => ref.type).join(','),
      sha256(_source.userId),
      _source.tags.join(','),
      _source.normalArticleReplyCount,
      _source.appId,
      _source.text,
      (_source.hyperlinks || []).join(','),
      _source.createdAt,
      _source.updatedAt,
      _source.lastRequestedAt,
    ]),
  ]);

  fs.writeFileSync('./opendata/articles.csv', csvString, 'utf8');
}

async function dumpArticleReplies(articles) {
  const csvInput = [
    [
      'articleId',
      'replyId',
      'userIdsha256',
      'negativeFeedbackCount',
      'positiveFeedbackCount',
      'replyType',
      'appId',
      'status',
      'createdAt',
      'updatedAt',
    ],
  ];

  articles.forEach(({ _source: { articleReplies }, _id }) => {
    if (!articleReplies) return;

    articleReplies.forEach(ar => {
      csvInput.push([
        _id,
        ar.replyId,
        sha256(ar.userId),
        ar.negativeFeedbackCount,
        ar.positiveFeedbackCount,
        ar.replyType,
        ar.appId,
        ar.status,
        ar.createdAt,
        ar.updatedAt,
      ]);
    });
  });

  fs.writeFileSync(
    './opendata/article_replies.csv',
    await generateCSV(csvInput),
    'utf8'
  );
}

async function dumpReplies(replies) {
  const csvString = await generateCSV([
    ['id', 'type', 'reference', 'userIdsha256', 'appId', 'text', 'createdAt'],
    ...replies.map(({ _source, _id }) => [
      _id,
      _source.type,
      _source.reference,
      sha256(_source.userId),
      _source.appId,
      _source.text,
      _source.createdAt,
    ]),
  ]);

  fs.writeFileSync('./opendata/replies.csv', csvString, 'utf8');
}

async function dumpReplyRequests(replyRequests) {
  const csvString = await generateCSV([
    ['articleId', 'userIdsha256', 'appId', 'createdAt'],
    ...replyRequests.map(({ _source }) => [
      _source.articleId,
      sha256(_source.userId),
      _source.appId,
      _source.createdAt,
    ]),
  ]);
  fs.writeFileSync('./opendata/reply_requests.csv', csvString, 'utf8');
}

async function dumpArticleReplyFeedbacks(articleReplyFeedbacks) {
  const csvString = await generateCSV([
    ['articleId', 'replyId', 'score', 'userIdsha256', 'appId', 'createdAt'],
    ...articleReplyFeedbacks.map(({ _source }) => [
      _source.articleId,
      _source.replyId,
      _source.score,
      sha256(_source.userId),
      _source.appId,
      _source.createdAt,
    ]),
  ]);
  fs.writeFileSync('./opendata/article_reply_feedbacks.csv', csvString, 'utf8');
}

async function run() {
  const articles = await scanIndex('articles');
  const replies = await scanIndex('replies');
  const replyRequests = await scanIndex('replyrequests');
  const articleReplyFeedbacks = await scanIndex('articlereplyfeedbacks');

  dumpArticles(articles);
  dumpArticleReplies(articles);
  dumpReplies(replies);
  dumpReplyRequests(replyRequests);
  dumpArticleReplyFeedbacks(articleReplyFeedbacks);
}

run();
