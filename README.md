Scripts for managing rumors db
==========

If you do not have `npm` and `yarn` installed, please see [Run with docker](#run-with-docker) section below.

Installation
---

```
yarn
```

Seeding data
---

Index mappings (schemas) are written in `schema/` directory.

### `npm run seed`

Runs all the scripts below.

---

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run csv -- <CSV_FILEPATH>`

Reads seed data from csv file, analyze the duplicated rumors & answers, then write to DB.


Run with docker
---

On dev environments with docker but no node, use:

```
$ cd rumors-db
$ docker run --rm -v `pwd`:/srv -w /srv kkarczmarczyk/node-yarn:6.9 yarn
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsapi_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run seed # or other npm commands
```

On production environments, use:

```
$ cd rumors-db
$ docker run --rm -v `pwd`:/srv -w /srv kkarczmarczyk/node-yarn:6.9 yarn
$ docker run --rm -it -v `pwd`:/srv -w /srv --network=rumorsdeploy_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run seed # or other npm commands
```
