export const VERSION = '1.2.0';

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

    // `users` index ID for the author of the reply
    replyUserId: { type: 'keyword' },

    // `users` index ID for the author of the article-reply
    articleReplyUserId: { type: 'keyword' },

    score: { type: 'byte' }, // 1, 0, -1
    comment: { type: 'text', analyzer: 'cjk_url_email' }, // user comment for the article reply

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    status: { type: 'keyword' }, // NORMAL, BLOCKED
  },
};
