'use strict';

const _ = require("lodash");
const db = require("./database");


/*
    Returns a Promise that gets fulfilled with an array of 
    grail_ids that match up with the options specified

    Options Object
    ==============================
    @param { string } grail_table - Grail table to update or insert into (ie. "grail_artist")
    @param { string } grail_table_unique_attribute - Grail attribute to reference unique row entities (ie. "grail_artist_id"),
    @param { string } grail_constraint_attribute - Query constraint used to find or update rows (ie. "mixradio_artist_id")
    @param { string } grail_constraint_value - Value of grail_constraint_attribute to be used in query (ie. "some mixradio artist id")
    @param { object } new_attributes - Attributes that will be updated or inserted
    @param { string } find_constraint_attribute - Grail attribute used to find rows to update "spotify_artist_id",
    @param { string } find_constraint_value - Value of find_constraint_attribute to be used in query (ie. "some spotify artist id")
    @param { array } insert_constraint_distinct_columns - Columns names that are used to find distinct rows when inserting new rows
    @return { promise } grail_entity_ids - The values of grail_table_unique_attribute of the updated or inserted rows
*/
exports.findAndUpdateorCreateGrailEntity = (opts, trx) => {

    return findMatchingGrailIds(opts, trx).then( (grail_ids) => {
        
        if (grail_ids.length > 0) {
            return updateGrailRows(grail_ids, opts, trx);
        }

        return insertGrailRows(opts, trx);
    });
}


/*
    Find rows from a grail table that match constraint parameters
*/
const findMatchingGrailIds = (opts, trx) => {
    return trx(opts.grail_table)
        .where(function() {
          this.where(opts.find_constraint_attribute, opts.find_constraint_value)
            .orWhereNull(opts.find_constraint_attribute)
        })
        .andWhere(opts.grail_constraint_attribute, opts.grail_constraint_value)
        .pluck(opts.grail_table_unique_attribute);
}


/*
    Update rows in a grail table using unique grail table ids

    @return { promise.array } - An empty array so update has a consistent
    return type as insertGrailRows
*/
const updateGrailRows = (grail_ids, opts, trx) => {
    return trx(opts.grail_table)
        .update(opts.new_attributes)
        .whereIn(opts.grail_table_unique_attribute, grail_ids)
        .then(() => []);
}


/*
    Insert rows into a grail table
*/
const insertGrailRows = (opts, trx) => {

    // Updates distinct rows with new attributes
    const updateRowsWithAttributes = (rows) => {
        return _.map(rows, (row) => {
            return _.merge(row, opts.new_attributes);
        });
    }

    // Batch inserts rows into db
    const insertUpdatedRows = (rows) => {
        const chunkSize = rows.length;
        const batchInsert = trx.batchInsert(opts.grail_table, rows, chunkSize);
        return Promise.all([chunkSize, batchInsert]);   
    }

    // Returns the IDs of the inserted rows
    const parseInsertedGrailIDs = ([insertSize, lastInsertedID]) => {
        const minId = (lastInsertedID[0] - (insertSize - 1));
        const maxId = lastInsertedID[0] + 1;
        return _.range(minId, maxId);
    }

    // Find distinct rows, then update, and insert updates
    return trx(opts.grail_table)
        .distinct(opts.insert_constraint_distinct_columns)
        .where(opts.grail_constraint_attribute, opts.grail_constraint_value)
        .then(updateRowsWithAttributes)
        .then(insertUpdatedRows)
        .then(parseInsertedGrailIDs);
}