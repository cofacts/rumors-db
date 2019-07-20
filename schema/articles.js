export default {
  properties: {
    text: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // auth
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    // Where this article is posted.
    // An article may be seen in multiple places, like blogs, FB posts or LINE messages.
    // "references" field should be a list of such occurences.
    //
    references: {
      type: 'nested',
      properties: {
        type: { type: 'keyword' }, // LINE, URL, etc
        permalink: { type: 'keyword' }, // permalink to the resource if applicable
        createdAt: { type: 'date' },

        // auth
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
      },
    },

    // Linkage between articles and replies
    articleReplies: {
      type: 'nested',
      properties: {
        // Who connected the replyId with the article.
        //
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        // Counter cache for feedbacks
        positiveFeedbackCount: { type: 'long' },
        negativeFeedbackCount: { type: 'long' },

        // One reply can have multipe replyconnections.
        //
        replyId: { type: 'keyword' },

        // Current reply type
        replyType: { type: 'keyword' },

        status: { type: 'keyword' }, // NORMAL, DELETED
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    // Cached counts of articleReplies with status = NORMAL.
    // The length of nested objects cannot be used in filters...
    normalArticleReplyCount: { type: 'long' },

    // Cached counter and timestamp from replyrequests
    replyRequestCount: { type: 'long' },
    lastRequestedAt: { type: 'date' },

    tags: { type: 'keyword' },

    // Links in article text
    hyperlinks: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' }, // exact URL found in the articles
        normalizedUrl: { type: 'keyword' }, // URL after normalization (stored in urls)
        title: { type: 'text', analyzer: 'cjk' },
        summary: { type: 'text', analyzer: 'cjk' }, // Extracted summary text
      },
    },
  },
};
