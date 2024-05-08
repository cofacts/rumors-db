/**
 * Generates the real index name with version from package.json
 *
 * @param index - name of the Elasticsearch index
 * @returns The real index name with version postfix
 */
export default function getIndexName(index: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { VERSION } = require(`../schema/${index}`);
  return `${index}_v${VERSION.replace(/\./g, '_')}`;
}
