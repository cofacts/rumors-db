import { z } from 'zod';
import { convert } from 'zoq';

/**
 * The table name
 */
export const TABLE = 'events';

const eventBatchSchema = z.object({
  createdAt: z.date().describe('Time of the event batch is sent'),
  text: z.string().describe('Message text'),
  messageSource: z.enum(['user', 'group', 'room']),
  events: z.array(
    z.object({
      time: z.date().describe('Time of the event'),
      category: z.string().nullable().describe('Event category'),
      action: z.string().nullable().describe('Event action'),
      label: z.string().nullable().describe('Event label'),
      value: z.string().nullable().describe('Event value'),
    }),
  ),
});

export const SCHEMA = convert(eventBatchSchema);

export type EventBatch = z.infer<typeof eventBatchSchema>;
