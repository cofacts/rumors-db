import 'dotenv/config';
import '../../util/catchUnhandledRejection';
import elasticsearch from 'elasticsearch';

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: 'trace',
});

const REPO_NAME = 'my_backup';
const BACKUP_NAME = 'snapshot_1';
const BACKUP_REPO_FILE_PATH = `/usr/share/elasticsearch/data/bkup`;

async function main() {
  await client.snapshot.createRepository({
    repository: REPO_NAME,
    body: {
      type: 'fs',
      settings: {
        location: BACKUP_REPO_FILE_PATH,
      },
    },
  });

  await client.snapshot.restore({
    repository: REPO_NAME,
    snapshot: BACKUP_NAME,
    waitForCompletion: true,
    body: {
      rename_pattern: '.+',
      rename_replacement: '$0_legacy',
    },
  });

  console.log('Restoration process complete');
}

main();
