import { z } from 'zod';

import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.2.1';

export const schema = z
  .object({
    date: dateSchema,

    /** article id or reply id */
    docId: z.string(),

    // the timestamp for when the data is fetched
    fetchedAt: dateSchema,

    stats: z
      .object({
        lineUser: z.number().nullable().optional(),
        lineVisit: z.number().nullable().optional(),
        webUser: z.number().nullable().optional(),
        webVisit: z.number().nullable().optional(),

        /** LIFF traffic, breakdown by source  */
        liff: z
          .array(
            z
              .object({
                // Source can be '' or null if not specified
                source: z.string().nullable(),
                user: z.number(),
                visit: z.number(),
              })
              .strict()
          )
          .optional(),
      })
      .strict(),

    type: z.enum(['article', 'reply']),

    /** May not exist or is null for old records */
    docUserId: z.string().nullable().optional(),
    /** May not exist or is null for old records */
    docAppId: z.string().nullable().optional(),
  })
  .strict();

export type Analytics = z.infer<typeof schema>;

export const examples: Analytics[] = [
  // No liff, just LINE or web
  {
    date: '2024-01-28T00:00:00.000+08:00',
    type: 'article',
    docId: '5484999832417-rumor',
    stats: {
      lineUser: null,
      lineVisit: null,
      webUser: 2,
      webVisit: 2,
      liff: [],
    },
    docUserId: '',
    docAppId: 'BOT_LEGACY',
    fetchedAt: '2024-01-27T23:59:04.641Z',
  },
  // With LIFF traffic
  {
    date: '2024-01-28T00:00:00.000+08:00',
    type: 'reply',
    docId: 'ZPVFTYsBAjOeMOklRUF2',
    stats: {
      lineUser: null,
      lineVisit: null,
      webUser: null,
      webVisit: null,
      liff: [
        {
          source: 'meiyu',
          visit: 1,
          user: 1,
        },
      ],
    },
    docUserId: 'xPyH-IYBC7Q3lHuU6oTY',
    docAppId: 'WEBSITE',
    fetchedAt: '2024-01-27T23:59:04.641Z',
  },
];

export default {
  dynamic: 'strict',
  properties: {
    date: { type: 'date' },

    // article id or reply id
    docId: { type: 'keyword' },

    // the timestamp for when the data is fetched
    fetchedAt: { type: 'date' },

    stats: {
      type: 'object',
      properties: {
        lineUser: { type: 'long' },
        lineVisit: { type: 'long' },
        webUser: { type: 'long' },
        webVisit: { type: 'long' },

        // LIFF traffic, breakdown by source
        liff: {
          type: 'nested',
          properties: {
            // Source can be '' if not specified
            source: { type: 'keyword' },
            user: { type: 'long' },
            visit: { type: 'long' },
          },
        },
      },
    },

    // either article or reply
    type: { type: 'keyword' },

    docUserId: { type: 'keyword' },
    docAppId: { type: 'keyword' },
  },
};
