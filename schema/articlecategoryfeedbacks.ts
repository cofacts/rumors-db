import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.1.2';

export const schema = z.object({
  articleId: z.string(),
  categoryId: z.string(),
  userId: z.string(),
  /** The user submits the feedback with which client. */
  appId: z.string(),
  score: z.number().int().min(-1).max(1),
  /** user comment for the article category */
  comment: z.string().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema.optional(),
  status: z.enum(['NORMAL', 'BLOCKED']),
});

export type ArticleCategoryFeedback = z.infer<typeof schema>;

export const examples: ArticleCategoryFeedback[] = [
  {
    articleId: 'IfzfyIYBC7Q3lHuU4FjJ',
    categoryId: 'kj287XEBrIRcahlYvQoS',
    userId: 'T93YInMBb3SlMKoAuqZi',
    appId: 'WEBSITE',
    score: -1,
    createdAt: '2024-01-26T15:06:26.585Z',
    updatedAt: '2024-01-26T15:06:26.585Z',
    comment: 'Not good enough',
    status: 'NORMAL',
  },
];

export default {
  dynamic: 'strict',
  properties: {
    articleId: { type: 'keyword' },
    categoryId: { type: 'keyword' },
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },
    score: { type: 'byte' },
    comment: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    status: { type: 'keyword' },
  },
};
