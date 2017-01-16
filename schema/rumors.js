export default {
  _all: {enabled: false},
  properties: {
    answerIds: { type: 'keyword', },
    text: { type: 'text', analyzer: 'cjk'},
    tags: {type: 'keyword'},
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' }
  }
};
