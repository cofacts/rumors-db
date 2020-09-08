export default {
  properties: {
    email: { type: 'keyword' },
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },
    avatarType: { type: 'keyword' },
    avatarData: { type: 'text' },

    appId: { type: 'keyword' },
    appUserId: { type: 'keyword' },

    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
