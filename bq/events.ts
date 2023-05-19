import { z } from 'zod';
import { convert } from 'zoq';

/**
 * The table name
 */
export const TABLE = 'events';

const eventBatchSchema = z.object({
  userId: z.string().nullable(),
  createdAt: z.date().describe('Time of the event batch is sent'),
  text: z.string().describe('Message text').nullable(),
  messageSource: z.enum(['user', 'group', 'room']).nullable(),
  events: z.array(
    z.object({
      time: z.date().describe('Time of the event'),
      category: z.string().nullable().describe('Event category'),
      action: z.string().nullable().describe('Event action'),
      label: z.string().nullable().describe('Event label'),
      value: z.number().nullable().describe('Event value'),
    }),
  ),
  extra: z.any().nullable().describe('Any other extra data that is set before the batch is sent'),
});

export const SCHEMA = convert(eventBatchSchema);

export type EventBatch = z.infer<typeof eventBatchSchema>;
