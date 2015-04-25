import path from 'path';
import url from 'url';
import _ from 'lodash';
import Q from 'q';
import feedRead from 'feed-read';
import cheerio from 'cheerio';
import request from 'request';

// Parses the available data formats out of
// the table in the feed description
export function parseDataFormats(content) {
  let result = {};
  // Load the description HTML into a jQuery-ish object
  let $ = cheerio.load(content);

  // The links in each first row contain our formats and their name
  $('.datasetGrid tr td:first-child a').each(function() {
    let format = $(this).html().toLowerCase();
    let link = $(this).attr('href');

    result[format] = link;
  });

  return result;
}

// Process and open data feed URL
export function processFeed(feedUrl) {
  // Read the feed from the URL
  return Q.nfcall(feedRead, feedUrl).then(function(feed) {
    // All RSS feeds only have a single entry
    if(feed.length === 1) {
      feed = feed[0];

      // Parse the dataset ID from the query parameter
      let dataset_id = url.parse(feed.link, true).query.DatasetID;

      // Construct our catalogue object
      return {
        title: feed.title,
        description: feed.content,
        // Parse the available formats
        formats: parseDataFormats(feed.content),
        date: feed.published, // date
        href: feed.link,
        dataset_id
      }
    }

    return null;
  });
}

// Crawl the open data catalogue
export function crawl(catalogueUrl) {
  let pathInfo = _.pick(url.parse(catalogueUrl), 'protocol', 'hostname', 'host', 'port');

  // Parse the open data catalogue
  return Q.nfcall(request, catalogueUrl).then(function(args) {
    let [ res, body ] = args;

    if(res.statusCode !== 200) {
      throw new Error('Got error status ' + res.status);
    }

    // Load the HTML into a simple jQuery-ish object
    let $ = cheerio.load(body);
    // Grab all links
    let links = $('a');
    let rssFeeds = [];

    links.each(function() {
      let href = $(this).attr('href');
      // If it links to an RSS feed
      if(href && href.indexOf('_layouts/OpenData/rss.ashx') !== -1) {
        // Create the full RSS feed URL
        let fullUrl = url.format(_.extend(url.parse(href, true), pathInfo));
        rssFeeds.push(fullUrl);
      }
    });

    // Load, parse and convert all our RSS feeds and kick out entries we coudln't parse
    return Q.all(rssFeeds.map(processFeed)).then(_.compact);
  });
}
