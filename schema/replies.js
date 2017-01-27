export default {
  _all: { enabled: false },
  properties: {
    versions: {
      properties: {
        type: { type: 'keyword' },
        text: { type: 'text', analyzer: 'cjk' },
        reference: { type: 'text' },
        createdAt: { type: 'date' },
      },
    },
    createdAt: { type: 'date' },
  },
};
