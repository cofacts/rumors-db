import { CronJob } from 'cron';
import cronstrue from 'cronstrue';
import { exec } from 'child_process';
import path from 'path';

const backup = (uri, options = {}) => {
  const mongodump = () => {
    const out = path.join(
      __dirname,
      'cofacts-backup',
      new Date().toISOString()
    );

    console.log(`mongodump backup to ${out} ...`);
    const cmd = `mongodump --uri=${uri} --out=${out}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    });
  };

  const { cronTime } = options;

  if (cronTime) {
    console.log(`mongodump will run [${cronstrue.toString(cronTime)}]`);

    const job = new CronJob(cronTime, function() {
      mongodump();
    });
    job.start();
  } else {
    mongodump();
  }
};

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cofacts';
const cronTime = process.env.CRON_TIME || '0 0 * * *';

backup(uri, {
  cronTime,
});
