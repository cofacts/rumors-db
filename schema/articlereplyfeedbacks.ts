import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.2.1';

export const schema = z.object({
  /** Target article-reply's article */
  articleId: z.string(),
  /** Target article-reply's reply */
  replyId: z.string(),

  /** `users` index ID for the author of the feedback */
  userId: z.string(),

  /** The user submits the feedback with which client. */
  appId: z.string(),

  /** `users` index ID for the author of the reply. May not exist for older doucments */
  replyUserId: z.string().optional(),

  /** `users` index ID for the author of the article-reply. May not exist for older doucments */
  articleReplyUserId: z.string().optional(),
  score: z.number().int().min(-1).max(1),
  comment: z.string().nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema.optional(),
  status: z.enum(['NORMAL', 'BLOCKED']),
});

export type ArticleReplyFeedback = z.infer<typeof schema>;

export const examples: ArticleReplyFeedback[] = [
  {
    articleId: '3q0ahb476dnm7',
    replyId: 'qvR504oBAjOeMOklBLwr',
    userId: 'CvduTY0BAjOeMOklmK6i',
    appId: 'WEBSITE',
    score: -1,
    createdAt: '2024-01-28T00:18:37.928Z',
    updatedAt: '2024-01-28T00:18:37.928Z',
    comment: '',
    status: 'NORMAL',
    replyUserId: 'tM9Gd4oBrkRFoI6raPG9',
    articleReplyUserId: 'tM9Gd4oBrkRFoI6raPG9',
  },

  // Older documents
  {
    score: 1,
    createdAt: '2021-05-15T04:42:37.528Z',
    appId: 'RUMORS_LINE_BOT',
    articleId: '3t467u6p8axzy',
    replyId: 'Dqkya3kB9w1KR1Ik6KRS',
    userId: 'j4S8C_355qXTmryzTOfpe17u00Z9CmGP5LQj8ApA7gF4v6FYw',
    updatedAt: '2021-05-15T04:42:37.528Z',
    status: 'NORMAL',
  },
];

export default {
  dynamic: 'strict',
  properties: {
    articleId: { type: 'keyword' },
    replyId: { type: 'keyword' },
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },
    replyUserId: { type: 'keyword' },
    articleReplyUserId: { type: 'keyword' },
    score: { type: 'byte' },
    comment: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    status: { type: 'keyword' },
  },
};
