import { z } from 'zod';
import { dateSchema } from '../util/sharedSchema';

export const VERSION = '1.0.1';

/**
 * Defines the schema for ydocs.
 */
export const schema = z.object({
  /** Represents the ydoc in binary format. */
  ydoc: z.string(),
  versions: z.array(
    z.object({
      /** Snapshot of the ydoc in binary format. */
      snapshot: z.string(),
      /** The creation date of the snapshot. */
      createdAt: dateSchema,
    })
  ),
});

export type YDoc = z.infer<typeof schema>;

export const examples: YDoc[] = [
  {
    ydoc: 'ARfLk4C8DAAnAQV1c2Vycw1EZW5uaXMgQm93ZGVuAScAy5OAvAwAA2lkcwAnAMuTgLwMAAJkcwAIAMuTgLwMAQF7QejwATlgAAAHAQtwcm9zZW1pcnJvcgMJcGFyYWdyYXBoBwDLk4C8DAQGAQDLk4C8DAUDAwDLk4C8DAIJAcuTgLwMAQgBg8uTgLwMCQkBy5OAvAwBBwKDy5OAvAwKCQHLk4C8DAEGA4HLk4C8DAgNg8uTgLwMCwkBy5OAvAwBFQKEy5OAvAwYCea0vuW5vum7noPLk4C8DBkLAcuTgLwMAgwJFwKBy5OAvAwcA4TLk4C8DCAD5Zyog8uTgLwMHQkBy5OAvAwBHgOBy5OAvAwhDITLk4C8DC4J5omN5pS/5bqcg8uTgLwMIgkBy5OAvAwBIwyBy5OAvAwxCITLk4C8DDoG6L+O6JGXg8uTgLwMMgkBy5OAvAwBMwgBy5OAvAwFBgMMDR4DIwwzCA==',
    versions: [
      {
        createdAt: '2023-09-13T17:35:08.214Z',
        snapshot: 'AcuTgLwMBQYDDA0eAyMMMwgBy5OAvAw+',
      },
    ],
  },
];

export default {
  properties: {
    ydoc: { type: 'binary' },
    versions: {
      type: 'nested',
      properties: {
        snapshot: { type: 'binary' },
        createdAt: { type: 'date' },
      },
    },
  },
};
