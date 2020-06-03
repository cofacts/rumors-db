export default {
  properties: {
    name: { type: 'keyword' },
    avatar: {
      properties: {
        type: { type: 'keyword' }, // url, gravatar, avataaars, openpeeps
        props: {
          // Allow arbitrary data for different avatar types
          enabled: false,
        },
      },
    },

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
