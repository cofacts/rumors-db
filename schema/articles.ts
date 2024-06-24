import { z } from 'zod';

import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.4.0';

export const schema = z.object({
  text: z.string(),
  // Can be null for very old sample messages
  createdAt: dateSchema.nullable(),
  updatedAt: dateSchema.optional().nullable(),

  /** User who submitted the article */
  userId: z.string(),
  appId: z.string(),

  /**
   * Where this article is posted.
   * An article may be seen in multiple places, like blogs, FB posts or LINE messages.
   * "references" field should be a list of such occurrences.
   */
  references: z.array(
    z.object({
      type: z.string(), // LINE, URL, etc
      permalink: z.string().optional(), // permalink to the resource if applicable
      createdAt: dateSchema.optional().nullable(),

      // auth
      userId: z.string().optional(),
      appId: z.string().optional(),
    })
  ),

  /** Linkage between articles and replies */
  articleReplies: z.array(
    z.object({
      /** Who connected the replyId with the article. */
      userId: z.string(),
      appId: z.string(),

      /** Counter cache for feedbacks */
      positiveFeedbackCount: z.number(),
      negativeFeedbackCount: z.number(),

      /** One reply can have multiple articlereplies. */
      replyId: z.string(),

      /** Current reply type */
      replyType: z.string(),

      status: z.enum(['NORMAL', 'DELETED', 'BLOCKED']),
      /** Can be null for very old replies */
      createdAt: dateSchema.nullable(),
      updatedAt: dateSchema.optional().nullable(),
    })
  ),

  /**
   * Cached counts of articleReplies with status = NORMAL.
   * The length of nested objects cannot be used in filters...
   */
  normalArticleReplyCount: z.number(),
  normalArticleCategoryCount: z.number(),

  /** Cached counter and timestamp from replyrequests */
  replyRequestCount: z.number(),
  lastRequestedAt: dateSchema.nullable().optional(),

  /** Links in article text */
  hyperlinks: z
    .array(
      z.object({
        /** exact URL found in the articles */
        url: z.string(),

        /** URL after normalization (stored in urls) */
        normalizedUrl: z.string().optional(),
        title: z.string().nullable(),

        /** Extracted summary text */
        summary: z.string().optional().nullable(),
      })
    )
    .optional(),

  articleCategories: z.array(
    z.object({
      /**
       * Who created the category
       * Empty if the category is added by AI
       */
      userId: z.string().optional(),
      appId: z.string().optional(),

      /** exists only for AI tags */
      aiModel: z.string().optional(),
      aiConfidence: z.number().optional(),

      /** Counter cache for feedbacks */
      positiveFeedbackCount: z.number(),
      negativeFeedbackCount: z.number(),

      /** Foreign key */
      categoryId: z.string(),

      status: z.enum(['NORMAL', 'DELETED', 'BLOCKED']),
      createdAt: dateSchema,
      updatedAt: dateSchema.optional(),
    })
  ),

  articleType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO']),

  /** There will be an attachment describing the file when articleType is not TEXT */
  attachmentUrl: z.string().optional(),
  /** hash (Perceptual Hash) for identifying two similar file */
  attachmentHash: z.string().optional(),

  status: z.enum(['NORMAL', 'BLOCKED']),

  /** transcript contributors */
  contributors: z
    .array(
      z.object({
        userId: z.string(),
        appId: z.string(),
        updatedAt: dateSchema,
      })
    )
    .optional(),
});

export type Article = z.infer<typeof schema>;
export type ArticleReply = Article['articleReplies'][number];
export type ArticleCategory = Article['articleCategories'][number];

export const examples: Article[] = [
  /** Text */
  {
    text: '潛水員，1年多沒發病！57歲三高女「突腦出血癱瘓」送院搶救　醫嘆「1習慣害慘她」：全身器官都壞光....\n  \n  👇 👇 👇 👇 👇 👇 👇 👇 👇 👇\n  https://www.healthlooker.com/post12097141206935?utm_source=311olnwm&utm_medium=group',
    createdAt: '2024-01-27T22:05:58.572Z',
    updatedAt: '2024-01-27T22:05:58.572Z',
    userId: 'j4S8C_evjlSW7CuHNdQxHgq8VRJbGo9GrGW1MbLA_qNauI2lY',
    appId: 'RUMORS_LINE_BOT',
    references: [
      {
        type: 'LINE',
        createdAt: '2024-01-27T22:05:58.572Z',
        userId: 'j4S8C_evjlSW7CuHNdQxHgq8VRJbGo9GrGW1MbLA_qNauI2lY',
        appId: 'RUMORS_LINE_BOT',
      },
    ],
    articleReplies: [],
    articleCategories: [],
    normalArticleReplyCount: 0,
    normalArticleCategoryCount: 0,
    replyRequestCount: 1,
    hyperlinks: [
      {
        normalizedUrl:
          'https://www.healthlooker.com/post12097141206935?utm_source=311olnwm&utm_medium=group',
        summary:
          '心臟內科醫師陳冠任日前在臉書上透露，不久前曾遇過一名從業13年以來、「低密度脂蛋白（LDL）」指數最高，...',
        title:
          '1年多沒發病！57歲三高女「突腦出血癱瘓」送院搶救　醫嘆「1習慣害慘她」：全身器官都壞光....',
        url: 'https://www.healthlooker.com/post12097141206935?utm_source=311olnwm&utm_medium=group',
      },
    ],
    articleType: 'TEXT',
    attachmentUrl: '',
    attachmentHash: '',
    status: 'NORMAL',
    lastRequestedAt: '2024-01-27T22:05:58.584Z',
  },

  /** Video */
  {
    attachmentHash: 'video.c0WXTxgpWmeukrn-o2jBmvFsgjYmxQfBdYQ2H0jGzlM',
    references: [
      {
        createdAt: '2023-10-06T02:01:15.471Z',
        appId: 'RUMORS_LINE_BOT',
        type: 'LINE',
        userId: 'j4S8C_iweauCo9Zwtwr43znOp7lH7ifkMTmOWvyHoAYXCJO7M',
      },
    ],
    userId: 'j4S8C_iweauCo9Zwtwr43znOp7lH7ifkMTmOWvyHoAYXCJO7M',
    createdAt: '2023-10-06T02:01:15.471Z',
    normalArticleCategoryCount: 0,
    articleReplies: [],
    normalArticleReplyCount: 0,
    articleCategories: [],
    articleType: 'VIDEO',
    replyRequestCount: 1,
    appId: 'RUMORS_LINE_BOT',
    lastRequestedAt: '2023-10-06T02:01:15.487Z',
    text: '第一招教你秒變失蹤人口,安排。 首先打開我們的手機撥號鍵,輸入信號信號21信號666警號鍵。 撥號出去之後,我們的手機就會變成空號,直接變失蹤人口。 當你想恢復正常的時候,就在撥號界面輸入警號鍵,警號鍵21警號鍵,或者警號鍵警號鍵002警號鍵取消就可以了。 你學會了嗎?\n',
    contributors: [
      {
        appId: 'WEBSITE',
        userId: 'ai-transcript',
        updatedAt: '2023-10-06T02:01:15.522Z',
      },
      {
        appId: 'WEBSITE',
        userId: 'AVqVwjqQyrDaTqlmmp_a',
        updatedAt: '2023-10-11T12:52:09.393Z',
      },
    ],
    hyperlinks: [],
    updatedAt: '2023-10-11T12:52:16.937Z',
    status: 'NORMAL',
  },

  /** Image */
  {
    attachmentHash: 'image.M498jA.AAAE-____AEo-P8AAgD3_6DePoAP_8AZ6B8B-AAA__8',
    references: [
      {
        createdAt: '2023-11-06T03:55:05.711Z',
        appId: 'RUMORS_LINE_BOT',
        type: 'LINE',
        userId: 'j4S8C_YQWzNWK2Una9Ki-edWAJSYZCePgogHqu5Z3q8NB9c8Y',
      },
    ],
    userId: 'j4S8C_YQWzNWK2Una9Ki-edWAJSYZCePgogHqu5Z3q8NB9c8Y',
    createdAt: '2023-11-06T03:55:05.711Z',
    normalArticleCategoryCount: 1,
    articleReplies: [
      {
        negativeFeedbackCount: 0,
        createdAt: '2023-11-07T06:49:48.792Z',
        replyType: 'RUMOR',
        positiveFeedbackCount: 3,
        appId: 'WEBSITE',
        replyId: 'T_WLqIsBAjOeMOklPKyW',
        userId: 'AVqVwjqQyrDaTqlmmp_a',
        status: 'NORMAL',
        updatedAt: '2023-11-07T06:49:48.792Z',
      },
    ],
    normalArticleReplyCount: 1,
    articleCategories: [
      {
        negativeFeedbackCount: 0,
        createdAt: '2023-11-07T06:49:53.364Z',
        positiveFeedbackCount: 0,
        appId: 'WEBSITE',
        userId: 'AVqVwjqQyrDaTqlmmp_a',
        categoryId: 'nD2n7nEBrIRcahlYwQoW',
        status: 'NORMAL',
        updatedAt: '2023-11-07T06:49:53.364Z',
      },
    ],
    articleType: 'IMAGE',
    replyRequestCount: 1,
    appId: 'RUMORS_LINE_BOT',
    lastRequestedAt: '2023-11-06T04:05:34.469Z',
    text: `
      我有體驗金 可以送你
      每天花十多分鐘就夠了
      當然是真的呀
      你要的話 我把連結給你
      就是你賺到錢提領的時候需要花一點
      時間去出售
      但熟悉了也很快
      體驗金1000美可以用2天 這兩天賺
      的佣金可以提領`,
    contributors: [
      {
        appId: 'WEBSITE',
        userId: 'ai-transcript',
        updatedAt: '2023-11-06T03:55:05.753Z',
      },
      {
        appId: 'WEBSITE',
        userId: 'AVqVwjqQyrDaTqlmmp_a',
        updatedAt: '2023-11-07T06:30:10.400Z',
      },
    ],
    hyperlinks: [],
    updatedAt: '2023-11-07T06:30:21.312Z',
    status: 'NORMAL',
  },

  // Old article
  {
    references: [
      {
        createdAt: null,
        type: 'LINE',
      },
    ],
    userId: '',
    createdAt: null,
    normalArticleCategoryCount: 1,
    articleReplies: [
      {
        createdAt: null,
        negativeFeedbackCount: 1,
        replyType: 'RUMOR',
        positiveFeedbackCount: 30,
        appId: 'BOT_LEGACY',
        replyId: 'sample3-answer',
        userId: 'Z0k1e_htbn13DDaJVWuaGzkqM5joDs85R2L_sbTq1sFQ0UEo8',
        status: 'DELETED',
        updatedAt: '2017-09-09T16:04:32.111Z',
      },
    ],
    normalArticleReplyCount: 2,
    articleCategories: [
      {
        negativeFeedbackCount: 0,
        createdAt: '2020-05-19T10:01:00.207Z',
        positiveFeedbackCount: 1,
        appId: 'DEVELOPMENT_BACKEND',
        aiModel: 'bert',
        userId: 'qO1C3_Mph8S3qfuQ5ylCX8Y-e7gc4ssfgBQN3t3JaKp5o06Pg',
        aiConfidence: 1,
        categoryId: 'mz2n7nEBrIRcahlYnQpz',
        status: 'NORMAL',
        updatedAt: '2020-05-19T10:01:00.207Z',
      },
    ],
    articleType: 'TEXT',
    replyRequestCount: 1,
    appId: 'BOT_LEGACY',
    lastRequestedAt: null,
    text: '17:33 黄玉雪',
    contributors: [],
    hyperlinks: [],
    updatedAt: null,
    status: 'NORMAL',
  },
];

export default {
  properties: {
    text: { type: 'text', analyzer: 'cjk_url_email' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    references: {
      type: 'nested',
      properties: {
        type: { type: 'keyword' },
        permalink: { type: 'keyword' },
        createdAt: { type: 'date' },

        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
      },
    },

    articleReplies: {
      type: 'nested',
      properties: {
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        positiveFeedbackCount: { type: 'long' },
        negativeFeedbackCount: { type: 'long' },

        replyId: { type: 'keyword' },

        replyType: { type: 'keyword' },

        status: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    normalArticleReplyCount: { type: 'long' },
    normalArticleCategoryCount: { type: 'long' },

    replyRequestCount: { type: 'long' },
    lastRequestedAt: { type: 'date' },

    hyperlinks: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' },
        normalizedUrl: { type: 'keyword' },
        title: { type: 'text', analyzer: 'cjk' },
        summary: { type: 'text', analyzer: 'cjk_url_email' },
      },
    },

    articleCategories: {
      type: 'nested',
      properties: {
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },

        aiModel: { type: 'keyword' },
        aiConfidence: { type: 'double' },

        positiveFeedbackCount: { type: 'long' },
        negativeFeedbackCount: { type: 'long' },

        categoryId: { type: 'keyword' },

        status: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },

    articleType: { type: 'keyword' },

    attachmentUrl: { type: 'keyword' },
    attachmentHash: { type: 'keyword' },

    status: { type: 'keyword' },

    contributors: {
      type: 'nested',
      properties: {
        userId: { type: 'keyword' },
        appId: { type: 'keyword' },
        updatedAt: { type: 'date' },
      },
    },
  },
};
