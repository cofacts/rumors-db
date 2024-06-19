import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.2.0';

export const schema = z.object({
  /** Target article-reply's article */
  articleId: z.string(),
  /** Target article-reply's reply */
  replyId: z.string(),

  /** `users` index ID for the author of the feedback */
  userId: z.string(),

  /** The user submits the feedback with which client. */
  appId: z.string(),

  /** `users` index ID for the author of the reply */
  replyUserId: z.string(),

  /** `users` index ID for the author of the article-reply */
  articleReplyUserId: z.string(),
  score: z.number().int().min(-1).max(1),
  comment: z.string().optional(),
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
