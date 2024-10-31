import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.0.1';

export const schema = z
  .object({
    createdAt: dateSchema,

    /** Last date the same user reported this combination of articles */
    updatedAt: dateSchema.optional(),

    /** Who reported this cooccurrence */
    userId: z.string(),
    appId: z.string(),

    /** The articles */
    articleIds: z.array(z.string()),
  })
  .strict();

export type Cooccurrence = z.infer<typeof schema>;

export const examples: Cooccurrence[] = [
  {
    articleIds: [
      '53FlBpABd3gcY0LpiBpN',
      '53FlBpABd3gcY0LpiBpN',
      'otgcb6jz2wd5',
    ],
    userId: 'j4S8C_kD1CmPG1n-Aw4ifsfZK0I0xFZpG5RJetR4KWkhowGBk',
    appId: 'RUMORS_LINE_BOT',
    createdAt: '2024-06-15T13:45:53.511Z',
    updatedAt: '2024-06-15T13:45:53.511Z',
  },
];

export default {
  dynamic: 'strict',
  properties: {
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },
    articleIds: { type: 'keyword' },
  },
};
