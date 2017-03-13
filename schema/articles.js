export default {
  _all: { enabled: false },
  properties: {
    replyConnectionIds: { type: 'keyword' },

    // when user deletes a reply from article, its replies goes to here
    deletedReplyConnectionIds: { type: 'keyword' },

    replyRequestIds: { type: 'keyword' },

    text: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    userId: { type: 'keyword' },
    from: { type: 'keyword' },

    // Where this article is posted.
    // An article may be seen in multiple places, like blogs, FB posts or LINE messages.
    // "references" field should be a list of such occurences.
    //
    references: {
      properties: {
        type: { type: 'keyword' }, // LINE, URL, etc
        permalink: { type: 'keyword' }, // permalink to the resource if applicable
        createdAt: { type: 'date' },
      },
    },
  },
};
