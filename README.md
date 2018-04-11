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

For example, the mappings in `schema/articles.js` would go to the index `articles_v1_0_0` and an alias from `articles` to `articles_v1_0_0` would be created after running `npm run schema`, given that the `version` in `package.json` is `1.0.0`.

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

First of all, go to production machine, run:

```
$ docker inspect --format='{{(index .Mounts 0).Source}}' rumorsdeploy_db_1
```

It should be a path like `/var/lib/docker/volumes/<some hash>/_data`. It is the path to the elastic search database.

Use tar to pack up the data:
```
$ tar cvzf backup.tar.gz /var/lib/docker/volumes/<some hash>/_data
```

Then transfer `backup.tar.gz` to your machine using `scp` or `rsync` or anything you like.

On your local machine, extract the tar file and put it in `esdata` directory of this project's root.

Then run:

```
$ docker-compose up
```

This spins up elasticsearch on `localhost:62223`, with Kibana available in `localhost:62223`, using the data in `esdata`.

## Gathering stats

`npm run stats` gathers editor usage, articles and replies creation statistics into `stats/output`
as CSV files.

By default, the statistics are derived from elasticsearch in `localhost:6226`.

To configure the elasticsearch host, please use:

```
$ HOST=http://some.host:port npm run stats
```

`HOST` defaults to `http://localhost:6226`.

## Populate seed data for dev environments.

Index mappings (schemas) are written in `schema/` directory. To seed the database for development, you should first start the development elastic search server using `docker-compose` as specified [rumors-api](https://github.com/MrOrz/rumors-api).

Then run:

```
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsapi_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' node:8 npm run seed
```

It connects to the database created clears all DB records and populates it with
sample rumors & answers.

---

## Other commands

These commands are invoked by commands mentioned above. See `package.json` for details.

### `npm run dump`
Dumps open data to `opendata/`

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run json -- <JSON_FILEPATH>`

Reads seed data from json file and write to ElasticSearch. (defaut to `localhost:62222`)
