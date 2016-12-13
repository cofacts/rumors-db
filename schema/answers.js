export default {
  _all: {enabled: false},
  properties: {
    versions: {
      properties: {
        text: {type: 'text'},
        reference: {type: 'text'},
        createdAt: { type: 'date' },
      }
    },
    createdAt: { type: 'date' },
  }
};
