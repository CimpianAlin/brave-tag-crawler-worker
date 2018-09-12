"use strict";

const lambdaIndex = require("./index");

(async _ => {
    lambdaIndex.handler({
        attrName: "name",
        attrValue: "microtip",
        url: (process.argv.length > 2) ? process.argv[2] : "https://brave.com",
        tagName: "meta",
        uuid: "123e4567-e89b-12d3-a456-426655440000",
    });
})();
