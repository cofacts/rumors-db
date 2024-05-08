export const VERSION = '1.0.0';

/**
 * A response from AI. Can be AI reply, OCR, speech to text, etc.
 */
export type AIResponse = {
  /** the document ID for this response */
  docId: string;

  /** type of this AI response. */
  type: 'AI_REPLY' | 'TRANSCRIPT';

  /** The user that requests an AI response */
  userId: string;
  appId: string;

  status: 'LOADING' | 'SUCCESS' | 'ERROR';

  /** AI response text */
  text?: string;

  /** The request to AI endpoint. Just for record, not indexed. */
  request: string;

  /** Token stats from AI endpoint response */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };

  createdAt: Date;
  updatedAt?: Date;
};

export const examples: AIResponse[] = [
  // Loading AI response; no text and usage yet
  {
  docId: '1',
  type: 'AI_REPLY',
  userId: '1',
  appId: '1',
  status: 'LOADING',
  request: '{"params": "Hello, World!"}',
  createdAt: new Date(),
  updatedAt: new Date(),
}, {
  docId: '2',
  type: 'TRANSCRIPT',
  userId: '1',
  appId: '1',
  status: 'SUCCESS',
  text: 'Hello, World!',
  request: '{"params": "Hello, World!"}',
  usage: {
    promptTokens: 2,
    completionTokens: 2,
    totalTokens: 4,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}];

export default {
  properties: {
    docId: { type: 'keyword' },

    type: { type: 'keyword' },

    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    status: { type: 'keyword' },

    text: { type: 'text', analyzer: 'cjk_url_email' },

    request: { type: 'keyword', index: false, doc_values: false },

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

