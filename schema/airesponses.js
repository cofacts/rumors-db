export const VERSION = '1.0.0';

// A response from AI. Can be AI reply, OCR, speech to text, etc.
//
export default {
  properties: {
    // the document ID for this response
    docId: { type: 'keyword' },

    // type of this AI response.
    type: { type: 'keyword' },

    // The user that requests an AI response
    //
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    // LOADING | SUCCESS | ERROR
    status: { type: 'keyword' },

    // AI response text
    text: { type: 'text', analyzer: 'cjk_url_email' },

    // The request to AI endpoint. Just for record, not indexed.
    request: { type: 'keyword', index: false, doc_values: false },

    // Token stats from AI endpoint response.
    usage: {
      type: 'object',
      properties: {
        promptTokens: { type: 'long' },
        completionTokens: { type: 'long' },
        totalTokens: { type: 'long' },
      },
    },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
