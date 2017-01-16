export default {
  _all: {enabled: false},
  properties: {
    versions: {
      properties: {
        text: {type: 'text', analyzer: 'cjk'},
        reference: {type: 'text'},
        createdAt: { type: 'date' },
      }
    },
    createdAt: { type: 'date' },
  }
};
