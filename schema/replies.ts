import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.2.0';

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

    /**
     * Dense-vector embeddings for hybrid search. Replies are text-only, so
     * there is always exactly one entry and `startOffsetSec` /
     * `endOffsetSec` are never written. Read path scores via nested KNN
     * retriever.
     *
     * `vector` is optional for the same reason as in articles.ts: ES 9
     * excludes `dense_vector` from the default `_source`
     * (`index.mapping.exclude_source_vectors`), so a plain GET returns
     * `[{}]` and a required `vector` would break `npm run scan`. Reindex /
     * recovery still rehydrate it from doc values.
     */
    embeddings: z
      .array(
        z
          .object({
            vector: z.array(z.number()).length(768).optional(),
            startOffsetSec: z.number().int().nonnegative().optional(),
            endOffsetSec: z.number().int().nonnegative().optional(),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export type Reply = z.infer<typeof schema>;

/** See the same constant in articles.ts for why this exists. */
const EXAMPLE_VECTOR = Array.from({ length: 768 }, () => 0.1);

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
    embeddings: [{ vector: EXAMPLE_VECTOR }],
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

    embeddings: {
      type: 'nested',
      properties: {
        vector: {
          type: 'dense_vector',
          dims: 768,
          index: true,
          similarity: 'cosine',
          // Same as articles.ts: pin the index type so we don't silently
          // inherit ES 9.1+'s BBQ default. Replies are an even smaller index
          // than articles, so there is nothing to gain from quantization.
          index_options: { type: 'hnsw' },
        },
        startOffsetSec: { type: 'integer' },
        endOffsetSec: { type: 'integer' },
      },
    },
  },
};
