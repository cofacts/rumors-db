export const VERSION = '1.4.0';

export default {
  properties: {
    text: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    // auth
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    // Where this article is posted.
    // An article may be seen in multiple places, like blogs, FB posts or LINE messages.
    // "references" field should be a list of such occurrences.
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

    // Linkage between articles and replies
    articleReplies: {
      type: 'nested',
      properties: {
        // Who connected the replyId with the article.
        //
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        // Counter cache for feedbacks
        positiveFeedbackCount: { type: 'long' },
        negativeFeedbackCount: { type: 'long' },

        // One reply can have multiple articlereplies.
        //
        replyId: { type: 'keyword' },

        // Current reply type
        replyType: { type: 'keyword' },

        status: { type: 'keyword' }, // NORMAL, DELETED, BLOCKED
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    // Cached counts of articleReplies with status = NORMAL.
    // The length of nested objects cannot be used in filters...
    normalArticleReplyCount: { type: 'long' },
    normalArticleCategoryCount: { type: 'long' },

    // Cached counter and timestamp from replyrequests
    replyRequestCount: { type: 'long' },
    lastRequestedAt: { type: 'date' },

    // Links in article text
    hyperlinks: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' }, // exact URL found in the articles
        normalizedUrl: { type: 'keyword' }, // URL after normalization (stored in urls)
        title: { type: 'text', analyzer: 'cjk' },
        summary: { type: 'text', analyzer: 'cjk_url_email' }, // Extracted summary text
      },
    },

    articleCategories: {
      type: 'nested',
      properties: {
        // Who created the category
        // Empty if the category is added by AI
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        // exists only for AI tags
        aiModel: { type: 'keyword' },
        aiConfidence: { type: 'double' },

        // Counter cache for feedbacks
        positiveFeedbackCount: { type: 'long' },
        negativeFeedbackCount: { type: 'long' },

        // Foreign key
        categoryId: { type: 'keyword' },

        status: { type: 'keyword' }, // NORMAL, DELETED, BLOCKED
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    articleType: { type: 'keyword' }, // TEXT, IMAGE, VIDEO, AUDIO

    // There will be an attachment describing the file when articleType is not TEXT
    attachmentUrl: { type: 'keyword' }, // URL stores the original file
    attachmentHash: { type: 'keyword' }, // hash (Perceptual Hash) for identifying two similar file

    status: { type: 'keyword' }, // NORMAL, BLOCKED

    // transcript contributors
    contributors: {
      type: 'nested',
      properties: {
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
        updatedAt: { type: 'date' }, // last contribute time of the user
      },
    },
  },
};
