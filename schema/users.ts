import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.2.3';

export const schema = z
  .object({
    email: z.string().optional(),
    name: z.string().nullable(),
    avatarUrl: z.string().optional(),
    slug: z.string().optional(),
    bio: z.string().optional(),

    avatarType: z
      .enum(['OpenPeeps', 'Gravatar', 'Facebook', 'Github'])
      .optional(),
    /** Stringified JSON props for openpeeps */
    avatarData: z.string().optional(),

    createdAt: dateSchema,
    updatedAt: dateSchema.optional(),

    /**
     * Timestamp for the last time the user performed a rumors-api API call.
     * Can be empty for users created before this field is introduced.
     */
    lastActiveAt: dateSchema.optional(),

    /**
     * URL to the announcement that blocks this user.
     * If given, the user is blocked from submitting visible contents.
     */
    blockedReason: z.string().optional(),

    // Optional fields, more restrictions below
    appId: z.string().optional(),
    appUserId: z.string().optional(),
    facebookId: z.string().optional(),
    githubId: z.string().optional(),
    twitterId: z.string().optional(),
    googleId: z.string().optional(),
    instagramId: z.string().optional(),

    /**
     * User's badges
     */
    badges: z
      .array(
        z
          .object({
            badgeId: z.string(),
            badgeMetaData: z.string(),
            isDisplayed: z.boolean(),
            createdAt: dateSchema,
            updatedAt: dateSchema,
          })
          .strict()
      )
      .optional(),

  })
  .strict()
  .and(
    /** Auth related IDs */
    z.union([
      /** Provided for apps other than websites */
      z.object({
        appId: z.string(),
        appUserId: z.string(),
      }),
      /** Social login for web users */
      z.union([
        z.object({ facebookId: z.string() }),
        z.object({ githubId: z.string() }),
        z.object({ twitterId: z.string() }),
        z.object({ googleId: z.string() }),
        z.object({ instagramId: z.string() }),
      ]),
    ])
  );

export type User = z.infer<typeof schema>;

export const examples: User[] = [
  // LINE bot user
  {
    name: '沉靜的泰山保羅',
    avatarType: 'OpenPeeps',
    avatarData:
      '{"accessory":"None","body":"StripedShirt","face":"CheersNM","hair":"MediumBangs","facialHair":"None","backgroundColorIndex":0.0176525644005896,"flip":false}',
    appId: 'LINE_BOT',
    appUserId: 'U000000000000000000000000',
    createdAt: '2024-06-16T00:10:38.571Z',
    updatedAt: '2024-06-16T00:10:38.571Z',
    lastActiveAt: '2024-06-16T00:15:13.990Z',
    badges: [
      {
        badgeId: 'B000000000000000000000000',
        badgeMetaData: '{"field":[["name":"標章名稱"],["userName":"申請人"],["applyDate":"申請日期"],["passDate":"通過日期"]],"data":{"name":"事實查核培訓認證","userName":"JayHuang","applyDate":"2024-11-14","passDate":"2024-11-15"}}',
        isDisplayed: true,
        createdAt: '2024-11-15T22:01:33.065Z',
        updatedAt: '2024-11-15T22:01:33.065Z'
      }
    ]
  },
  // Web user
  {
    name: 'Milk Tea',
    avatarUrl: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?FB',
    facebookId: '000000000000000',
    createdAt: '2024-06-15T22:01:33.065Z',
    updatedAt: '2024-06-15T22:01:33.065Z',
    lastActiveAt: '2024-06-15T22:04:05.161Z',
    badges: []
  },
  {
    name: null /** May be null for unknown reasons in rare cases */,
    githubId: '000000',
    createdAt: '2017-03-10T17:35:04.330Z',
    updatedAt: '2017-03-10T17:35:04.330Z',
    badges: []
  },
];

export default {
  dynamic: 'strict',
  properties: {
    email: { type: 'keyword' },
    name: { type: 'keyword' },
    avatarUrl: { type: 'keyword' },
    slug: { type: 'keyword' },
    bio: { type: 'text', analyzer: 'cjk_url_email' },

    avatarType: { type: 'keyword' }, // AvatarTypeEnum: OpenPeeps/Gravatar/Facebook/Github
    avatarData: {
      type: 'keyword',
      index: false,
      doc_values: false,
    }, // stringified json props for openpeeps

    appId: { type: 'keyword' },
    appUserId: { type: 'keyword' },

    facebookId: { type: 'keyword' },
    githubId: { type: 'keyword' },
    twitterId: { type: 'keyword' },
    googleId: { type: 'keyword' },
    instagramId: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },

    lastActiveAt: { type: 'date' },

    blockedReason: { type: 'keyword' },

    badges: {
      type: 'nested',
      properties: {
        badgeId: { type: 'keyword' },
        badgeMetaData: { type: 'keyword' },
        isDisplayed: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      },
    },
  },
};
