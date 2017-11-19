Scripts for managing rumors db
==========

[![Build Status](https://travis-ci.org/cofacts/rumors-db.svg?branch=master)](https://travis-ci.org/cofacts/rumors-db)

If you do not have `npm` and `yarn` installed, please see [Run with docker](#run-with-docker) section below.

##Installation

```
$ yarn

# If you have docker but don't have yarn, run:
$ docker run --rm -v `pwd`:/srv -w /srv kkarczmarczyk/node-yarn:6.9 yarn
```


## Populate seed data for dev environments.

Index mappings (schemas) are written in `schema/` directory. To seed the database for development, you should first start the development elastic search server using `docker-compose` as specified [rumors-api](https://github.com/MrOrz/rumors-api).

Then run:

```
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsapi_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run seed
```

It connects to the database created clears all DB records and populates it with
sample rumors & answers.

## Prepare database for unit test

See [rumors-api](https://github.com/MrOrz/rumors-api)

## Prepare database for search performance evaluation

See [rumors-api](https://github.com/MrOrz/rumors-api)

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

On your local machine, extract the tar file and put it in a directory (for simplicity's sake, let's name the directory `volume`.)

Run this on your local machine to start a elasticsearch server on port `6226` with the downloaded data:

```
$ docker run -d -p 6226:9200/tcp -v "$PWD/volume":/usr/share/elasticsearch/data elasticsearch
```

---

## Other commands

These commands are invoked by commands mentioned above. See `package.json` for details.

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run json -- <JSON_FILEPATH>`

Reads seed data from json file and write to ElasticSearch. (defaut to `localhost:62222`)


### `npm run csv`

Used to create JSON seed files from CSV files exported from Airtable.

Reads seed data from csv file, analyze the duplicated rumors & answers, then write to JSON. (Default to the same directory of CSV_FILEPATH, but with `.json` postfix)


## Run with docker

On dev environments with docker but no node, use:

```
$ cd rumors-db
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsapi_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run seed # or other npm commands
```

On production environments, use:

```
$ cd rumors-db
$ docker run --rm -v `pwd`:/srv -w /srv kkarczmarczyk/node-yarn:6.9 yarn
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsdeploy_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run seed # or other npm commands
```
