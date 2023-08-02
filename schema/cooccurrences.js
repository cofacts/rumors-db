export const VERSION = '1.0.0';

export default {
  properties: {
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    articleIds: { type: 'keyword' },
  },
};
