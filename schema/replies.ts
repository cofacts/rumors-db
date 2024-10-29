import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.1.1';

export const schema = z
  .object({
    /** May be non-exist for very old sample replies */
    userId: z.string().nullable().optional(),
    appId: z.string().nullable(),
    type: z.enum(['RUMOR', 'NOT_RUMOR', 'OPINIONATED', 'NOT_ARTICLE']),
    text: z.string(),
    reference: z.string().optional(),

    /** May be non-exist for very old sample replies */
    createdAt: dateSchema.nullable(),
    /** Links in article text */
    hyperlinks: z
      .array(
        z
          .object({
            /** exact URL found in the articles */
            url: z.string(),

            /** URL after normalization (stored in urls) */
            normalizedUrl: z.string().optional(),
            title: z.string().nullable(),

            /** Extracted summary text */
            summary: z.string().optional().nullable(),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export type Reply = z.infer<typeof schema>;

export const examples: Reply[] = [
  {
    userId: 'iEJ5C3oBgBgcuemXUCAD',
    appId: 'WEBSITE',
    type: 'RUMOR',
    text: '依據釋字585號解釋，立法院擁有一定調查權，但必須符合下列條件',
    reference:
      '一、釋字585號解釋(憲法法庭網站)\nhttps://cons.judicial.gov.tw/docdata.aspx?fid=100&id=310766',
    createdAt: '2024-06-12T16:35:04.058Z',
    hyperlinks: [
      {
        normalizedUrl:
          'https://cons.judicial.gov.tw/docdata.aspx?fid=100&id=310766',
        summary: '',
        title: '',
        url: 'https://cons.judicial.gov.tw/docdata.aspx?fid=100&id=310766',
      },
    ],
  },
];

export default {
  dynamic: 'strict',
  properties: {
    userId: { type: 'keyword' },
    appId: { type: 'keyword' },
    type: { type: 'keyword' },
    text: { type: 'text', analyzer: 'cjk_url_email' },
    reference: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    hyperlinks: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' },
        normalizedUrl: { type: 'keyword' },
        title: { type: 'text', analyzer: 'cjk' },
        summary: { type: 'text', analyzer: 'cjk_url_email' },
      },
    },
  },
};
