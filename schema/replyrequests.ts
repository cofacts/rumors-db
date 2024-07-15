import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.1.1';

/**
 * A request from users for an article to be replied.
 * (articleId, userId, appId) should be unique throughout DB.
 */
export const schema = z.object({
  /**
   * The article ID and user ID is used in calculating replyrequests' ID.
   */
  articleId: z.string(),

  /**
   * Auth
   * only recognizable for within a client.
   */
  userId: z.string(),

  /**
   * The user submits the request with which client.
   * Should be one of backend APP ID, 'BOT_LEGACY', 'RUMORS_LINE_BOT' or 'WEBSITE'
   */
  appId: z.string(),

  /**
   * Why the ReplyRequest is created
   */
  reason: z.string().optional(),

  /**
   * Editor's feedbacks for the reply request's reason
   */
  feedbacks: z
    .array(
      z.object({
        /**
         * Auth
         */
        userId: z.string(),
        appId: z.string(),

        /**
         * The score of the feedback. Should be 1, 0, or -1.
         */
        score: z.number().int().min(-1).max(1),
        createdAt: dateSchema,
        updatedAt: dateSchema,
      })
    )
    .optional(),

  /**
   * Counter cache for feedbacks
   */
  positiveFeedbackCount: z.number().int().optional(),
  negativeFeedbackCount: z.number().int().optional(),

  /**
   * The creation date of the reply request.
   */
  createdAt: dateSchema.nullable(),
  updatedAt: dateSchema.optional(),

  status: z.enum(['NORMAL', 'BLOCKED']),
});

export type ReplyRequest = z.infer<typeof schema>;

export const examples: ReplyRequest[] = [
  // Empty examples
  {
    articleId: '2jkv7up5zsxvd',
    userId: 'j4S8C_8KsZJXEoHKNoC02Cciz8SHEYqgJTAeaKz_9-wGUu_iE',
    appId: 'RUMORS_LINE_BOT',
    reason: '',
    feedbacks: [],
    positiveFeedbackCount: 0,
    negativeFeedbackCount: 0,
    createdAt: '2024-06-16T00:15:39.857Z',
    updatedAt: '2024-06-16T00:15:39.857Z',
    status: 'NORMAL',
  },
  {
    createdAt: null,
    appId: 'BOT_LEGACY',
    articleId: 'sample19-rumor',
    userId: '',
    status: 'NORMAL',
  },
  // With feedbacks
  {
    articleId: '2n426ven0zp2x',
    userId: 'j4S8C_Lh7XPq6xxWCrOjTkjOeEAw69ghOkPtq09XGZOaNb8sk',
    appId: 'RUMORS_LINE_BOT',
    reason: '因為沒有講述到底是哪家銀行？令人一頭霧水',
    feedbacks: [
      {
        score: 1,
        createdAt: '2024-05-29T04:59:26.955Z',
        appId: 'WEBSITE',
        userId: 'V4K3wo8B3RbBUEe2g1xi',
        updatedAt: '2024-05-29T04:59:26.955Z',
      },
    ],
    positiveFeedbackCount: 1,
    negativeFeedbackCount: 0,
    createdAt: '2024-05-29T04:54:24.896Z',
    updatedAt: '2024-05-29T04:55:21.066Z',
    status: 'NORMAL',
  },
];

// A request from users for an article to be replied.
// (articleId, userId, appId) should be unique throughout DB.
//
export default {
  dynamic: 'strict',
  properties: {
    articleId: { type: 'keyword' },

    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    reason: { type: 'text', analyzer: 'cjk_url_email' },

    feedbacks: {
      type: 'nested',
      properties: {
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        score: { type: 'byte' }, // 1, 0, -1
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    positiveFeedbackCount: { type: 'long' },
    negativeFeedbackCount: { type: 'long' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    status: { type: 'keyword' },
  },
};
