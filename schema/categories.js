export const VERSION = '1.1.0';

export default {
  properties: {
    title: { type: 'text', analyzer: 'cjk' },
    target: { type: 'text', analyzer: 'cjk' }, // The target editors. Separated by line breaks.
    description: { type: 'text', analyzer: 'cjk' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    status: { type: 'keyword' }, // NORMAL, DELETED
    parentId: { type: 'keywords' }, // Parent category's ID
  },
};
