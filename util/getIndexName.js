import { version } from '../package.json';

export default function getIndexName(index) {
  return `${index}_v${version.replace(/\./g, '_')}`;
}
