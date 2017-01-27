export default {
  _all: { enabled: false },
  properties: {
    answerIds: { type: 'keyword' },
    text: { type: 'text', analyzer: 'cjk' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
