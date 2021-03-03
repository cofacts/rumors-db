/**
 * Generates the real index name with version from package.json
 *
 * @param {string} index - name of the Elasticsearch index
 * @returns {string} The real index name with version postfix
 */
export default function getIndexName(index) {
  const { VERSION } = require(`../schema/${index}.js`);
  return `${index}_v${VERSION.replace(/\./g, '_')}`;
}
