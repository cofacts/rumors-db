import { z } from 'zod';

/**
 * ES supports string and number representation; ES JS SDK supports JS Date.
 * When reading from ES JS SDK, it will always return a string.
 *
 * @ref: https://www.elastic.co/guide/en/elasticsearch/reference/current/date.html
 */
export const dateSchema = z.union([
  z.string().datetime({ /* Allow timezones */ offset: true }),
  z.number(),
  z.date(),
]);
