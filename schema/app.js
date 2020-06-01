export default {
  _all: { enabled: false },
  properties: {
    adminUserId: { type: 'keyword' },
    title: { type: 'text' }, // User-readable name for the app
    description: { type: 'text', analyzer: 'cjk' }, // intro for the app

    secret: { type: 'keyword' }, // for backend apps

    // for browser apps
    corsOrigins: { type: 'keyword' }, // can have multiple

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
