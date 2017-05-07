import replies from './replies';

// The connection between an article and a reply.
//
// replyconnection's _id should be `${article_id}__${reply_id}` to avoid
// two replyConnections referring the same pair of articles & replies.
//
export default {
  _all: { enabled: false },
  _parent: {
    type: 'articles',
  },
  properties: {
    // Who connected the replyId with the article.
    //
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    // Cache from the latest version of associated reply.
    // Updated to each replyconnections manually when new versions of a reply are available.
    //
    currentReply: {
      properties: replies.properties.versions.properties,
    },

    // one reply can have multipe replyconnections.
    //
    replyId: { type: 'keyword' },

    // segments
    segment: { type: 'text', analyzer: 'cjk_url_email' },
    segmentRange: { type: 'integer_range' }, // start index & end index of the segment

    status: { type: 'keyword' }, // NORMAL, DELETED
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
