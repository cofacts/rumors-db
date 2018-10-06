Scripts for managing rumors db
==========

[![Build Status](https://travis-ci.org/cofacts/rumors-db.svg?branch=master)](https://travis-ci.org/cofacts/rumors-db)

## Installation

Please first install Node.JS 8.

```
$ npm i
```

## Index mapping versions

All mappings exist in `schema/` directory, with `schema/index.js` being the entry point.

When loading tschema into DB using `npm run schema`, it appends `_vX_Y_Z` in the created indecies,

then create an alias to the index name, in which `X.Y.Z` is the version name in `package.json`.

For example, the mappings in `schema/articles.js` would go to the index `articles_v1_0_0` and an
alias from `articles` to `articles_v1_0_0` would be created after running `npm run schema`, given
that the `version` in `package.json` is `1.0.0`.

## Running migrations

All index mappings are already the latest, so if you are starting a database with fresh data,
there is no need for migrations.

However, if you are reading data from a legacy version of mapping, you may need migrations.

Migration scripts are put under `db/migrations`, which can be run as:

```
$ ./node_modules/.bin/babel-node db/migrations/<migration script name>
```

## Prepare database for unit test

See [rumors-api](https://github.com/cofacts/rumors-api)

## Backup production database and run on local machine

According to [rumors-deploy](https://github.com/cofacts/rumors-deploy/), the production DB raw data
should be available in `rumors-deploy/volumes/db-production`. (Staging is in `db-staging` instead).

Just tar the `rumors-deploy/volumes/db-production`, download to local machine, extract the tar file
and put it in `esdata` directory of this project's root.

Then run:

```
$ docker-compose up
```

This spins up elasticsearch on `localhost:62223`, with Kibana available in `localhost:62224`, using
the data in `esdata`.

## Updating schema

After adding fields / removing fields from indices, you will need to reload schema because
elasticsearch mappings are not editable for opened indices.

This can be done by:

1. Manually bumping the schema version in package.json
2. Run `npm run reload`

The `npm run reload` would create indices with latest schema & package.json version postfix,
perform reindex, modifies alias and removes all old indices.

---

## Other commands

These commands are invoked by commands mentioned above. See `package.json` for details.

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run seed`

Inserts seed (defined in `db/loadSeed.js`) into the database
