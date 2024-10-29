import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.1.1';

/**
 * Schema definition for URLs.
 */
export const schema = z
  .object({
    /**
     * Exact URL found in the articles.
     */
    url: z.string(),
    /**
     * The canonical URL fetched from the page.
     */
    canonical: z.string(),
    /**
     * Title of the page.
     */
    title: z.string(),
    /**
     * Extracted summary text.
     */
    summary: z.string(),
    /**
     * Fetched raw html input. Can be very long.
     */
    html: z.string(),
    /**
     * Image URL for preview. It could be a base64 string, which can be too long.
     */
    topImageUrl: z.string().optional(),
    /**
     * The date and time the URL was fetched.
     */
    fetchedAt: dateSchema,
    /**
     * Status code of the response.
     */
    status: z.number().int(),
    /**
     * Error returned by cofacts-url-resolver.
     */
    error: z.string().optional(),
    /**
     * rumors-api cleanupUrls.js script flag field.
     */
    isReferenced: z.boolean().optional(),
  })
  .strict();

export type Url = z.infer<typeof schema>;

export const examples: Url[] = [
  // From metadata, thus status = 0 and html is empty
  {
    canonical: 'https://www.chinatimes.com/realtimenews/20230611001492-260405',
    title: '台大急診塞爆 等床滿到大廳電梯口！醫1句話酸爆衛福部 - 生活',
    summary:
      '本土第四波新冠疫情升溫，台北巿立聯合醫院陽明院區胸腔科醫師蘇一峰表示，有民眾目擊台大醫院急診室等待床位的病患，從急診室一路排滿整條走廊，甚至外溢到一樓大廳電梯口，其他醫院也有上百名病患在等床，但衛福部',
    html: '',
    url: 'https://www.chinatimes.com/realtimenews/20230611001492-260405',
    status: 0,
    fetchedAt: '2023-06-11T08:12:15.590Z',
    isReferenced: true,
  },
  // 403
  {
    canonical: 'https://blog.udn.com/G_103196354613610418/179358898',
    title: 'Access Denied',
    summary:
      'You don\'t have permission to access "http://blog.udn.com/G_103196354613610418/179358898" on this server.\nReference #18.9260760.1686367657.822aae5',
    html: '<html><head>\n<title>Access Denied</title>\n</head><body>\n<h1>Access Denied</h1>\n \nYou don\'t have permission to access "http://blog.udn.com/G_103196354613610418/179358898" on this server.<p>\nReference #18.9260760.1686367657.822aae5\n\n\n</p></body></html>',
    url: 'https://blog.udn.com/G_103196354613610418/179358898',
    status: 403,
    fetchedAt: '2023-06-10T03:27:40.875Z',
    isReferenced: true,
  },
];

export default {
  dynamic: 'strict',
  properties: {
    url: { type: 'keyword' },
    canonical: { type: 'keyword' },
    title: { type: 'text', analyzer: 'cjk' },
    summary: { type: 'text', analyzer: 'cjk_url_email' },
    html: { type: 'keyword', index: false, doc_values: false },

    topImageUrl: { type: 'keyword', index: false, doc_values: false },

    fetchedAt: { type: 'date' },
    status: { type: 'short' },
    error: { type: 'keyword' },

    isReferenced: { type: 'boolean' },
  },
};
