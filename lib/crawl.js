"use strict";

const urlLib = require("url");

const request = require("request-promise-native");
const cheerio = require("cheerio");

const searchForTagsOnPage = async (url, tagName) =>{
    const options = {
        url: url.toString(),
        headers: {
            'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15",
        }
    };

    const pageText = await request(options);
    const $ = cheerio.load(pageText);
    const elements = $(tagName);

    const pageUrlString = url.toString();

    const anchorsWithHrefs = $("a").filter((_, elm) => !!(elm.attribs.href));
    const anchorUrls = anchorsWithHrefs.map((_, elm) => {
            try {
                return new urlLib.URL(elm.attribs.href, pageUrlString);
            } catch (_) {
                return undefined;
            }
        });

    const sameDomainUrls = anchorUrls.get().filter(elm => {
        if (elm.host !== url.host) {
            return false;
        }

        return (elm.toString() !== pageUrlString);
    });

    const uniqueSameDomainUrls = new Set(sameDomainUrls);

    return {
        urls: uniqueSameDomainUrls,
        elements,
    };
};


const filterTagsByTerms = (elements, attrName, attrValue = undefined) => {
    const valueFilter = attrValue && new RegExp(attrValue, "i");

    return elements.filter((_, elm) => {
        const elmAttrValue = cheerio(elm).attr(attrName);
        if (elmAttrValue === undefined) {
            return false;
        }

        if (valueFilter === undefined) {
            return true;
        }

        return valueFilter.test(elmAttrValue);
    });
};

const crawl = async (url, tagName, attrName = undefined, attrValue = undefined) => {
    const tagsOnPage = await searchForTagsOnPage(url, tagName);
    const {elements, anchors} = tagsOnPage;

    if (elements.length === 0 || attrName === undefined) {
        const elementsText = elements.map((_, elm) => {
            return cheerio.html(elm);
        }).get();
        return {
            elementsText,
            anchors,
        };
    }

    const filteredElements = filterTagsByTerms(elements, attrName, attrValue);
    const elementsText = filteredElements.map((_, elm) => {
        return cheerio.html(elm);
    }).get();

    return {
        elementsText,
        anchors,
    };
};


module.exports = {
    crawl,
};
