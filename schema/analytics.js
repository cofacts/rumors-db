export default {
  properties: {
    date: { type: 'date' },

    // article id or reply id
    docId: { type: 'keyword' },

    // the timestamp for when the data is fetched
    fetchedAt: { type: 'date' },

    stats: {
      type: 'object',
      properties: {
        lineUser: { type: 'long' },
        lineVisit: { type: 'long' },
        webUser: { type: 'long' },
        webVisit: { type: 'long' },
      },
    },

    // either article or reply
    type: { type: 'keyword' },

    docUserId: { type: 'keywork' },
  },
};
