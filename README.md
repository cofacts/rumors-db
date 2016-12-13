Scripts for managing rumors db
==========

Seeding data
---

Index mappings (schemas) are written in `schema/` directory.

### `npm run clear`

Deletes all indices.

### `npm run schema`

Creates indices with specified mappings.

### `npm run airtable`

Export data from airtable to specified elasticsearch.

### `npm run seed`

Runs all the scripts above.
