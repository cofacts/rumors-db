export default {
  properties: {
    // // The article ID and reply ID is used in calculating replyrequests' ID.
    articleId: { type: 'keyword' },
    replyId: { type: 'keyword' },

    // Auth
    userId: { type: 'keyword' },
    // The user submits the feedback with which client.
    // Should be one of backend APP ID, 'BOT_LEGACY', 'RUMORS_LINE_BOT' or 'WEBSITE'
    appId: { type: 'keyword' },

    score: { type: 'byte' }, // 1, 0, -1
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
