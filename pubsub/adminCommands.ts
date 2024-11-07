import { Schema } from 'avsc';

const schema: Schema = {
  type: 'record',
  name: 'AdminCommand',
  fields: [
    { name: 'command', type: 'string' },
    { name: 'args', type: 'string' },
  ],
};

export default schema;
