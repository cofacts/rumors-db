export const VERSION = '1.1.0';

export default {
  properties: {
    title: { type: 'text', analyzer: 'cjk' },
    description: { type: 'text', analyzer: 'cjk' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
