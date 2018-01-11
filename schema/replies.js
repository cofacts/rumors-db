export default {
  properties: {
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    type: { type: 'keyword' }, // 'RUMOR', 'NOT_RUMOR', 'OPINIONATED', 'NOT_ARTICLE'
    text: { type: 'text', analyzer: 'cjk_url_email' },
    reference: { type: 'text' },
    createdAt: { type: 'date' },
  },
};
