/**
 * Reads all files in the `pubsub` directory and generates Typescript type to pubsub/types
 */

import fs from 'fs/promises';
import path from 'path';
import * as schema from '../pubsub';
import { toTypeScript } from '@ovotech/avro-ts';

async function main() {
  await Promise.all(
    Object.entries(schema).map(async ([name, schemaObj]) => {
      const outputPath = path.join(__dirname, '../pubsub/types', `${name}.ts`);
      const ts = toTypeScript(schemaObj);
      await fs.writeFile(outputPath, ts);
    })
  );
}

main().catch(console.error);
