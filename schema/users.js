export const VERSION = '1.2.0';

export default {
  properties: {
    email: { type: 'keyword' },
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },
    slug: { type: 'keyword' },
    bio: { type: 'text', analyzer: 'cjk_url_email' },

    avatarType: { type: 'keyword' }, // AvatarTypeEnum: OpenPeeps/Gravatar/Facebook/Github
    avatarData: {
      type: 'keyword',
      index: false,
      doc_values: false,
    }, // stringified json props for openpeeps

    appId: { type: 'keyword' },
    appUserId: { type: 'keyword' },

    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },
    googleId: { type: 'keyword' },
    instagramId: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // Timestamp for the last time the user performed a rumors-api API call
    lastActiveAt: { type: 'date' },
  },
};
