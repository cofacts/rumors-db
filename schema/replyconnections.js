// The connection between an article and a reply.
// A replyConnection should only appear within on 1 article's replyConnectionIds.
// (We put foreign keys in "articles" index so that articles can count replies fast.)
//
// Alsom replyconnection's _id should be `${article_id}__${reply_id}` to avoid
// two replyConnections referring the same pair of articles & replies.
//
export default {
  _all: { enabled: false },
  properties: {
    replyId: { type: 'keyword' },

    // Who connected the replyId with the article.
    //
    userId: { type: 'keyword' },
    from: { type: 'keyword' },

    // May be lots of feedbacks, thus split into another index.
    // Put foreign keys here, again, for getting total number of feedbacks fast.
    feedbackIds: { type: 'keyword' },
  },
};
