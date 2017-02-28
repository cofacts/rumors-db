export default {
  _all: { enabled: false },
  properties: {
    adminUserId: { type: 'keyword' },

    secret: { type: 'keyword' }, // for backend apps
    redirectUrl: { type: 'keyword' }, // for in-browser apps

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
