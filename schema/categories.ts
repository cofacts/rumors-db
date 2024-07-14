import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.1.0';

export const schema = z.object({
  title: z.string(),
  description: z.string(),
  createdAt: dateSchema,
  updatedAt: dateSchema.optional(),

  /** Populated by CreateCategory API */
  userId: z.string().optional(),
  appId: z.string().optional(),
});

export type Category = z.infer<typeof schema>;

export const examples: Category[] = [
  {
    description:
      '目標編輯\n- 資安專家\n- 科普作家\n- 科技編輯\n\n5G、大數據、人工智慧、資料蒐集隱私疑慮、資訊安全等等相關資訊。',
    title: '科技、資安、隱私',
    createdAt: '2020-05-07T10:21:34.450Z',
    updatedAt: '2020-05-07T10:21:34.450Z',
  },
];

export default {
  dynamic: 'strict',
  properties: {
    title: { type: 'text', analyzer: 'cjk' },
    description: { type: 'text', analyzer: 'cjk' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },
  },
};
