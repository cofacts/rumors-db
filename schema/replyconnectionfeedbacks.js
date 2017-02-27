export default {
  _all: { enabled: false },
  properties: {
    score: { type: 'byte' }, // 1, 0, -1
    userId: { type: 'keyword' },

    // The user submits the feedback with which client.
    // Should be something like API-key in the future.
    from: { type: 'keyword' },
    comment: { type: 'text', analyzer: 'cjk' },
  },
};
