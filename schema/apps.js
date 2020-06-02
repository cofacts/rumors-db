export default {
  _all: { enabled: false },
  properties: {
    adminUserId: { type: 'keyword' },
    title: { type: 'text' }, // User-readable name for the app
    description: { type: 'text', analyzer: 'cjk' }, // intro for the app
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // for backend apps
    secret: { type: 'keyword' },

    // for browser apps
    corsOrigins: { type: 'keyword' }, // can have multiple
  },
};
