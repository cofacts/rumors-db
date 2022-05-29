export const VERSION = '1.2.0';

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

        // LIFF traffic, breakdown by source
        liff: {
          type: 'nested',
          properties: {
            // Source can be '' if not specified
            source: { type: 'keyword' },
            user: { type: 'long' },
            visit: { type: 'long' },
          },
        },
      },
    },

    // either article or reply
    type: { type: 'keyword' },

    docUserId: { type: 'keyword' },
    docAppId: { type: 'keyword' },
  },
};
