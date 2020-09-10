export default {
  properties: {
    email: { type: 'keyword' },
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },

    avatarType: { type: 'keyword' }, // url, gravatar, openpeeps
    avatarData: {
      type: 'keyword',
      index: false,
      doc_values: false,
    }, // could be url or json props for openpeeps

    appId: { type: 'keyword' },
    appUserId: { type: 'keyword' },

    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
