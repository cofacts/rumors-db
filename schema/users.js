export default {
  properties: {
    email: { type: 'keyword' },
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },

    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
