"use strict";

const mysqlLib = require("promise-mysql");

const connect = async _ => {
    return await mysqlLib.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });
};

const idForBatch = async (connection, uuid, tagName, depth, breadth, attrName, attrValue) => {
    const selectQuery = "SELECT id FROM batches WHERE uuid = ?";
    const selectParams = [uuid];
    const selectRs = await connection.query(selectQuery, selectParams);

    if (selectRs.length === 1) {
        return selectRs[0].id;
    }

    const insertQuery = `
        INSERT INTO
            batches
            (
                uuid,
                tag_name,
                depth,
                breadth,
                attr_name,
                attr_value
            )
        VALUES
            (?, ?, ?, ?, ?, ?);
    `;
    const insertParams = [uuid, tagName, depth, breadth, attrName, attrValue];
    const insertRs = await connection.query(insertQuery, insertParams);
    return insertRs.insertId;
};

const idForUrl = async (connection, batchId, url, parentUrlId = undefined) => {
    const insertQuery = `
        INSERT INTO
            urls
            (
                url,
                batch_id,
                parent_url_id
            )
        VALUES
            (?, ?, ?);
    `;
    const insertParams = [url, batchId, parentUrlId];
    const insertRs = await connection.query(insertQuery, insertParams);
    return insertRs.insertId;
};

const idForElement = async (connection, urlId, elmText) => {
    const insertQuery = `
        INSERT INTO
            elements
            (
                elm_text,
                url_id
            )
        VALUES
            (?, ?);
    `;
    const insertParams = [elmText, urlId];
    const insertRs = await connection.query(insertQuery, insertParams);
    return insertRs.insertId;
};

const recordResults = async (batchParams, urlParams, matchingElmsText) => {
    const connection = await connect();

    let batchId;
    if (Number.isInteger(batchParams.batchId) === true) {
        batchId = batchParams.batchId;
    } else {
        const {uuid, tagName, depth, breadth, attrName, attrValue} = batchParams;
        batchId = await idForBatch(connection, uuid, tagName, depth, breadth, attrName, attrValue);
    }

    const urlId = await idForUrl(connection, batchId, urlParams.url, urlParams.parentUrlId);

    const elmIds = [];
    for (const aElmText of matchingElmsText) {
        const elmId = await idForElement(connection, urlId, aElmText);
        elmIds.push(elmId);
    }

    await connection.end();

    return {
        batchId,
        urlId,
        elmIds,
    };
};

module.exports = {
    recordResults,
};
