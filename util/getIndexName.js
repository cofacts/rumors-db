import { version } from '../package.json';

/**
 * Generates the real index name with version from package.json
 *
 * @param {string} index - name of the Elasticsearch index
 * @returns {string} The real index name with version postfix
 */
export default function getIndexName(index) {
  return `${index}_v${version.replace(/\./g, '_')}`;
}
