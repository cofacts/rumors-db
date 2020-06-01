export default {
  properties: {
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // Timestamp for the last time the user performed a rumors-api API call
    lastActiveAt: { type: 'date' },

    // Only for users created by browser apps, managed by passport.js.
    //
    email: { type: 'keyword' },
    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },

    // Only for users created by backend app, managed by the app itself.
    //
    appUserId: { type: 'keyword' },
    appId: { type: 'keyword' },
  },
};
