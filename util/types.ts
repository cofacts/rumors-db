/**
 * ES supports string and number representation; ES JS SDK supports JS Date.
 * When reading from ES JS SDK, it will always return a string.
 *
 * @ref: https://www.elastic.co/guide/en/elasticsearch/reference/current/date.html
 */
export type ESDate =
  // strict_date_optional_time
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html#strict-date-time
  | `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
  | Date
  | number;
