/**
 * How to use this script to migrate elasticsearch schema
 *  1. Start ssh port forwarding `ssh -L 62222:staging.server.path.to:62222 root@staging.server.path.to`
 *  2. Add `ELASTICSEARCH_URL=http://localhost:62222` to .env
 *  3. Reindex the following indexes using `npm run reindex`:
 *     articlecategoryfeedbacks, articlereplyfeedbacks, replyrequests, users
 *  4. Run `npx babel-node db/migrations/202110-fill-statuses.js`
 */


