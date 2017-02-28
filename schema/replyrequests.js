// A request from users for an article to be replied.
// (articleId, userId, from) should be unique throughout DB.
//
export default {
  _all: { enabled: false },
  properties: {
    // only recognizable for within a client.
    //
    userId: { type: 'keyword' },

    // The user submits the request with which client.
    // Should be one of backend APP ID, 'BOT_LEGACY', 'RUMORS_LINE_BOT' or 'WEBSITE'
    from: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
