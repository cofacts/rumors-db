import elasticsearch from 'elasticsearch';
import config from 'config';

import '../util/catchUnhandledRejection';
import fs from 'fs';

const client = new elasticsearch.Client({
  host: config.get('ELASTICSEARCH_URL'),
  log: 'info',
});


async function scanIndex(index) {
  let result = [];

  const initialResult = await client.search({
    index,
    size: 200,
    scroll: '5m'
  });

  const totalCount = initialResult.hits.total;

  initialResult.hits.hits.forEach(hit => {
    result.push(hit);
  })

  while (result.length < totalCount) {
    const scrollResult = await client.scroll({
      scrollId: initialResult._scroll_id,
      scroll: '5m'
    });
    scrollResult.hits.hits.forEach(hit => {
      result.push(hit);
    });
  }

  return result;
};

async function dumpArticles(articles) {
  const fields = [
    'id',
    'references',      // array of strings
    'userId',
    'tags',            // array of strings
    'normalArticleReplyCount',
    'appId',
    'text',
    'hyperlinks',
    'createdAt',
    'updatedAt',
    'lastRequestedAt'
  ];
  let csvString = fields.join(',') + '\n';
  articles.forEach(article => {
    csvString += article._id + ',';
    const body = article._source;
    csvString += body.references.map(ref => ref.type).join(',') + ',';
    csvString += body.userId + ',';
    csvString += body.tags.join(',') + ',';
    csvString += body.normalArticleReplyCount + ',';
    csvString += body.appId + ',';
    csvString += '"' + body.text.replace(/\"/g, '""') + '",'; // escape double quote in CSV format
    csvString += '"' + (body.hyperlinks && body.hyperlinks.join(',')) + '",';
    csvString += body.createdAt + ',';
    csvString += body.updatedAt + ',';
    csvString += body.lastRequestedAt + '\n';
  });
  fs.writeFileSync('./opendata/articles.csv', csvString, 'utf8');
}


async function dumpArticleReplies(articles) {
  const fields = [
    'articleId',
    'replyId',
    'userId',
    'negativeFeedbackCount',
    'positiveFeedbackCount',
    'replyType',
    'appId',
    'status',
    'createdAt',
    'updatedAt'
  ];
  let csvString = fields.join(',') + '\n';
  articles.forEach(article => {
    if (article._source.articleReplies) {
      article._source.articleReplies.forEach(reply => {
        csvString += article._id + ',';
        csvString += reply.replyId + ',';
        csvString += reply.userId + ',';
        csvString += reply.negativeFeedbackCount + ',';
        csvString += reply.positiveFeedbackCount + ',';
        csvString += reply.replyType + ',';
        csvString += reply.appId + ',';
        csvString += reply.status + ',';
        csvString += reply.createdAt + ',';
        csvString += reply.updatedAt + '\n';
      });
    }
  });
  fs.writeFileSync('./opendata/article_replies.csv', csvString, 'utf8');
}


async function dumpReplies(replies) {
  const fields = [
    'id',
    'type',
    'reference',
    'userId',
    'appId',
    'text',
    'createdAt'
  ];
  let csvString = fields.join(',') + '\n';
  replies.forEach(reply => {
    const body = reply._source;
    csvString += reply._id + ',';
    csvString += body.type + ',';
    csvString += '"' + (body.reference && body.reference.replace(/\"/g, '""')) + '",';
    csvString += body.userId + ',';
    csvString += body.appId + ',';
    csvString += '"' + body.text.replace(/\"/g, '""') + '",';
    csvString += body.createdAt + '\n';
  });
  fs.writeFileSync('./opendata/replies.csv', csvString, 'utf8');
}


async function dumpReplyRequests(replyRequests) {
  const fields = [
    'articleId',
    'createdAt'
  ];
  let csvString = fields.join(',') + '\n';
  replyRequests.forEach(reply => {
    const body = reply._source;
    csvString += body.articleId + ',';
    csvString += body.createdAt + '\n';
  });
  fs.writeFileSync('./opendata/reply_requests.csv', csvString, 'utf8');
}

async function dumpArticleReplyFeedbacks(articleReplyFeedbacks) {
  const fields = [
    'articleId',
    'replyId',
    'score',
    'createdAt'
  ];
  let csvString = fields.join(',') + '\n';
  articleReplyFeedbacks.forEach(reply => {
    const body = reply._source;
    csvString += body.articleId + ',';
    csvString += body.replyId + ',';
    csvString += body.score + ',';
    csvString += body.createdAt + '\n';
  });
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