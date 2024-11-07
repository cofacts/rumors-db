Scripts for managing rumors db
==========

[![Build Status](https://travis-ci.org/cofacts/rumors-db.svg?branch=master)](https://travis-ci.org/cofacts/rumors-db)

## Installation

Please first install Node.JS 18.

```
$ npm i
```

## Configuration

For development, copy `.env.sample` to `.env` and make necessary changes.

## Elasticsearch

### Anatomy of a schema file

A schema file under `schema/` directory consists of:
- `VERSION` -- see the next section for details.
- The default export -- an object that represents the mapping of the index.
- Exports a zod schema named `<indexName>Schema`, which can be used to generate Typescript
  definitions as well as use as validator.
- Exports a Typescript definition of the index name in UpperCamelCase, created from zod.
- The `examples` which is an array of the example data that can be inserted into the index and correctly type check.
  We use the examples to:
  - Provide readable examples of what is actually stored in ES index
  - Check if the index schema is as expected
  - Check if Typescript definition is as expected

### Index mapping versions

All mappings exist in `schema/` directory, with `schema/index.js` being the entry point.

When loading schema into DB using `npm run schema`, it appends `_${VERSION}` in the created indexes,

then create an alias to the index name, according to `VERSION` const in the respective schema file.

For example, the mappings in `schema/articles.js` would go to the index `articles_v1_0_0` and an
alias from `articles` to `articles_v1_0_0` would be created after running `npm run schema`, given
that the `VERSION` in `schema/article.js` is `1.0.0`.

### Running migrations

All index mappings are already the latest, so if you are starting a database with fresh data,
there is no need for migrations.

However, if you are reading data from a legacy version of mapping, you may need migrations.

Migration scripts are put under `db/migrations`, which can be run as:

```
$ ./node_modules/.bin/babel-node db/migrations/<migration script name>
```

### Prepare database for unit test

See [rumors-api](https://github.com/cofacts/rumors-api)

### Backup production database and run on local machine

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

### Updating schema for one index

After adding fields / removing fields from an index file, you will need to reload schema because
ElasticSearch mappings are not editable for opened indices.

This can be done by:

1. Manually bumping the schema version in the schema file
2. Run `npm run reload -- <index file name>` (For instance, `npm run reload -- replyrequests`)

The script would create indices with latest schema & package.json version postfix,
perform reindex, modifies alias and removes the old index.

## BigQuery

Please manually create dataset, handle permission on Google Cloud, and setup related environment variables in `.env`.

Run the following script to create big query tables under the dataset specified in the environment variable.
```
./node_modules/.bin/babel-node db/setBqTables.ts --extensions .ts,.js
```

## Google Pubsub

We define the Google Pubsub message schema for machine-to-machine communication of `rumors-api` under `pubsub/` directory.

The schema should be in [`avro` format](https://cloud.google.com/pubsub/docs/schemas#avro-format), but defined in Typescript as a default export.

`pubsub/index.ts` re-exports all the schemas in the directory.

After defining the schema, run the following script to generate the Typescript type for them:
```
npm run gen:pubsub
```

To update the schema in Google Pubsub, run the following script:
```
TBA
```

---

## Other commands

These commands are invoked by commands mentioned above. See `package.json` for details.

### `npm run clear`

Deletes all indices.

### `npm run schema [-- indexName]`

Creates indices with specified mappings.

By default it will create all indexes that exists in `schema/` directory, and will error if the index
already exists.

We can create one index by specifying `indexName` in the command.

### `npm run scan [-- indexName]`

Scans through all existing document in `indexName` to see if the documents match the current zod schema.

If `indexName` is not given, all indexes in schema will be scanned.

### `npm run seed`

Inserts examples in each schema into the database
