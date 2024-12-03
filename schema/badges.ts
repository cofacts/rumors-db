import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.0.0';
/**
 * - `displayName` is the compact version of `name`
 * - `description` can contain Markdown syntax
 */
export const schema = z
  .object({
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    link: z.string().url(),
    icon: z.string(),
    borderImage: z.string(),
    createdAt: dateSchema,
    updatedAt: dateSchema.optional(),
    /**
     * Badge's issuer list, for verify the source of the awarding request
     */
    issuers: z.array(z.string()),
  })
  .strict();

export type Badge = z.infer<typeof schema>;

export const examples: Badge[] = [
  {
    name: 'TFC事實查核培訓認證-2024',
    displayName: '事實查核培訓認證',
    description:
      '簡介\n由台灣事實查核中心(www.tfc-Taiwan.org.tw) 認證，完成特定事實查核與媒體素養培訓(課程連結)，即可在Cofacts平台使用此標章。\n使用標章需主動提出申請，填寫下方資料，台灣事實查核中心審核符合資格，即會授權使用。\n申請資料僅供台灣事實查核中心核對身分，將依循個人資料保護法，不會另作其他用途。',
    link: 'https://tfc-taiwan.org.tw/',
    icon: 'https://tfc-taiwan.org.tw/icon.svg',
    borderImage: 'https://tfc-taiwan,org.tw/badge_border.png',
    createdAt: '2024-11-07T10:21:34.450Z',
    updatedAt: '2024-11-07T10:21:34.450Z',
    issuers: ['2mici23ju6n@FCW6nanng', 'XXCF@UJCVVHIesfj3IIw4'],
  },
];

export default {
  dynamic: 'strict',
  properties: {
    name: { type: 'text' },
    displayName: { type: 'text' },
    description: { type: 'text' },
    link: { type: 'text' },
    icon: { type: 'text' },
    borderImage: { type: 'text' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    issuers: { type: 'keyword' },
  },
};
