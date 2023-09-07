export const VERSION = '1.0.1';

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
