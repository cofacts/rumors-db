export const VERSION = '1.1.0';

export default {
  properties: {
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    type: { type: 'keyword' }, // 'RUMOR', 'NOT_RUMOR', 'OPINIONATED', 'NOT_ARTICLE'
    text: { type: 'text', analyzer: 'cjk_url_email' },
    reference: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },

    // Links in the text & reference
    hyperlinks: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' }, // exact URL found in the articles
        title: { type: 'text', analyzer: 'cjk' },
        summary: { type: 'text', analyzer: 'cjk' }, // Extracted summary text
      },
    },
  },
};
