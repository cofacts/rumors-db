export default {
  properties: {
    articleId: { type: 'keyword' },
    categoryId: { type: 'keyword' },

    // Auth
    userId: { type: 'keyword' },
    // The user submits the feedback with which client.
    // Should be one of backend APP ID, 'BOT_LEGACY', 'RUMORS_LINE_BOT' or 'WEBSITE'
    appId: { type: 'keyword' },

    score: { type: 'byte' }, // 1, -1
    comment: { type: 'text', analyzer: 'cjk_url_email' }, // user comment for the article category

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
