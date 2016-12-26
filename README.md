Scripts for managing rumors db
==========

Installation
---

```
yarn
```

Seeding data
---

Index mappings (schemas) are written in `schema/` directory.

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run csv -- <CSV_FILEPATH>`

Reads seed data from csv file, analyze the duplicated rumors & answers, then write to DB.


### `npm run airtable`

Export data from airtable to specified elasticsearch.

### `npm run seed`

Runs all the scripts above.

Run with docker
---

On environments with docker but no node (like production server), use:

```
$ docker run --rm -v `pwd`:/srv -w /srv kkarczmarczyk/node-yarn:6.9 yarn
$ docker run --rm -v `pwd`:/srv -w /srv --network=rumorsdeploy_default -e 'NODE_CONFIG={"ELASTICSEARCH_URL":"http://db:9200"}' kkarczmarczyk/node-yarn:6.9 npm run airtable # or other npm commands
```
