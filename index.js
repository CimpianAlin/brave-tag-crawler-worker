"use strict";

const urlLib = require("url");

const utilsLib = require("./lib/utils");
const crawlLib = require("./lib/crawl");
const dbLib = require("./lib/db");

/**
 * Supported arguments:
 *
 * Required:
 *  - url (string): The URL to crawl.
 *  - tagName (string): the tag name to search for.
 *
 * Either / Or:
 *  - uuid (string): 36 character uuid4 identifier for this crawl.
 *  - batchId (id): Integer unique id for the batch being crawled.  Either this
 *    or the uuid must be provided.
 *
 * Optional:
 *  - depth (int): If provided, the number of pages deep on the current domain
 *                 to continue crawling.
 *  - breadth (int): If provided, the maximum number of pages on the current
 *                  domain to crawl.
 *  - debug (bool): If true, whether to print additional debugging information
 *                  to the console.
 *  - attrName (string): If provided, will limit the results to tags that
 *                       have the given attribute.
 *  - attrValue (string): If provided, will limit results that have the given
 *                        attribute, with a value that matches this string.
 *                        This string will be interpreted as a regular
 *                        expression (i.e. new RegExp(attrValue, "i")).
 *  - parentUrlId (int): If provided, the database Id for the URL that generated
 *                       this crawl (if crawling depth x breadth).
 */
const handler = async lambdaEvent => {
    if (lambdaEvent.Records) {
        for (const args of lambdaEvent.Records) {
            await dispatch(JSON.parse(args.body));
        }
    } else {
        await dispatch(lambdaEvent);
    }
};

const dispatch = async args => {
    const [argsAreValid, errorMsg] = utilsLib.areArgsValid(args);
    if (argsAreValid === false) {
        throw errorMsg;
    }

    const url = new urlLib.URL(args.url);
    const tagName = args.tagName;

    const depth = args.depth || 0;
    const breadth = args.breadth || 0;

    const {attrName, attrValue} = args;

    const queryResults = await crawlLib.crawl(url, tagName, attrName, attrValue);
    const {elementsText} = queryResults;

    const batchParams = {
        batchId: args.batchId,
        uuid: args.uuid,
        tagName,
        depth,
        breadth,
        attrName,
        attrValue,
    };

    const urlParams = {
        url: url.toString(),
        parentUrlId: args.parentUrlId,
    };

    await dbLib.recordResults(batchParams, urlParams, elementsText);
};

module.exports.handler = handler;
