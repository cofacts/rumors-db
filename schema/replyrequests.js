// A request from users for an article to be replied.
// (articleId, userId, appId) should be unique throughout DB.
//
export default {
  properties: {
    // The article ID and user ID is used in calculating replyrequests' ID.
    articleId: { type: 'keyword' },

    // Auth
    // only recognizable for within a client.
    //
    userId: { type: 'keyword' },
    // The user submits the request with which client.
    // Should be one of backend APP ID, 'BOT_LEGACY', 'RUMORS_LINE_BOT' or 'WEBSITE'
    appId: { type: 'keyword' },

    // Why the ReplyRequest is created
    reason: { type: 'text', analyzer: 'cjk_url_email' },

    // Editor's feedbacks for the reply request's reason
    feedbacks: {
      type: 'nested',
      properties: {
        // Auth
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        score: { type: 'byte' }, // 1, 0, -1
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    // Counter cache for feedbacks
    positiveFeedbackCount: { type: 'long' },
    negativeFeedbackCount: { type: 'long' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
