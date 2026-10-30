/**
 * Fails when an index's mapping differs from a base copy of the schema while
 * its VERSION stays the same.
 *
 * `npm run schema` creates `<index>_v<VERSION>`, so a mapping change without a
 * VERSION bump never produces a new index to reindex into.
 *
 * Usage:
 *   npm run check-version-bump -- <path to the base schema directory>
 *
 * In CI the base schema is extracted from the PR's base branch into .base/.
 */
import path from 'path';
import { isDeepStrictEqual } from 'util';
import * as schema from '../schema';

type SchemaModule = { VERSION: string; default: object };

const baseDirArg = process.argv[2];
if (!baseDirArg) {
  console.error('Usage: check-version-bump <base schema directory>');
  process.exit(1);
}
const baseDir = path.resolve(baseDirArg);

function loadBase(index: string): SchemaModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path.join(baseDir, index));
  } catch (e) {
    // A new index has no base to compare with.
    if ((e as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') return null;
    throw e;
  }
}

const errors: string[] = [];

for (const index of Object.keys(schema)) {
  const base = loadBase(index);
  if (!base) {
    console.log(`${index}: new index, skipped`);
    continue;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const head: SchemaModule = require(`../schema/${index}`);
  const mappingChanged = !isDeepStrictEqual(head.default, base.default);
  const versionChanged = head.VERSION !== base.VERSION;

  if (mappingChanged && !versionChanged) {
    errors.push(
      `${index}: mapping changed but VERSION is still ${head.VERSION}. Bump VERSION in schema/${index}.ts.`
    );
  } else if (mappingChanged) {
    console.log(
      `${index}: mapping changed, VERSION ${base.VERSION} -> ${head.VERSION}`
    );
  }
}

if (errors.length) {
  errors.forEach((e) => console.error(e));
  process.exit(1);
}
console.log('OK: every changed mapping has a new VERSION.');
