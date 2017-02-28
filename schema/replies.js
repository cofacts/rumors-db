export default {
  _all: { enabled: false },
  properties: {
    versions: {
      properties: {
        userId: { type: 'keyword' },
        from: { type: 'keyword' },

        type: { type: 'keyword' }, // 'RUMOR', 'NOT_RUMOR', 'NOT_ARTICLE'
        text: { type: 'text', analyzer: 'cjk' },
        reference: { type: 'text' },
        createdAt: { type: 'date' },
      },
    },
    createdAt: { type: 'date' },
  },
};
