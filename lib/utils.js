"use strict";

const urlLib = require("url");

const areArgsValid = args => {
    const validUuid = (args.uuid !== undefined && args.uuid.length === 36);
    const validBatchId = (Number.isInteger(args.batchId) && args.batchId > 0);
    if (!validUuid && !validBatchId) {
        return [false, "Must provide either a valid batch UUID or a valid batch Id"];
    }

    if (args.url === undefined) {
        return [false, "`url` argument must be provided."];
    }

    try {
        new urlLib.URL(args.url);
    } catch (e) {
        return [false, `Invalid url, recevied error: '${e}'`];
    }

    if (typeof args.tagName !== "string") {
        return [false, `Invalid argument for tagName, recieved value of type ${typeof args.tagName}`];
    }

    if (args.debug !== undefined && typeof args.debug !== "boolean") {
        return [false, `Invalid value for debug, expected boolean, received ${args.debug}`];
    }

    const expectedInts = ["depth", "breath"];
    for (const aField of expectedInts) {
        const aValue = args[aField];

        if (aValue === undefined) {
            continue;
        }

        if (Number.isInteger(aValue) !== false) {
            return [false, `Invalid value for ${aField}, expected integer, received ${typeof aValue}`];
        }

        if (aValue < 0) {
            return [false, `${aField} must be >= 0, received ${aValue}`];
        }
    }

    if (args.attrValue !== undefined && args.attrName === undefined) {
        return [false, "Using the 'attrValue' argument requires providing the 'attrName' argument."];
    }

    if (args.parentUrlId !== undefined) {
        if (Number.isInteger(args.parentUrlId) === false || args.parentUrlId <= 0) {
            return [false, "parentUrlId must be not provided, or a positive int."];
        }
    }

    return [true, undefined];
};


module.exports = {
    areArgsValid,
};
