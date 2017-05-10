export default {
  _all: { enabled: false },
  properties: {
    text: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // auth
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    // Where this article is posted.
    // An article may be seen in multiple places, like blogs, FB posts or LINE messages.
    // "references" field should be a list of such occurences.
    //
    references: {
      type: 'nested',
      properties: {
        type: { type: 'keyword' }, // LINE, URL, etc
        permalink: { type: 'keyword' }, // permalink to the resource if applicable
        createdAt: { type: 'date' },

        // auth
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
      },
    },

    // Who said they want to reply.
    //
    pendingReplies: {
      type: 'nested',
      properties: {
        createdAt: { type: 'date' },

        // auth
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
      },
    },

    tags: { type: 'keyword' },
  },
};
