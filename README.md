# yyc.io

The City Of Calgary open data API

Go to [yyc.io](http://yyc.io) to sign up for news about releases and public API availability.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/yycjs/yyc.io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Installation

With NodeJS installed and MongoDB running locally, clone the repository and run

> npm install
> npm start


Then go to [http://localhost:3030](http://localhost:3030)

The application will go through the [city open data catalogue](https://data.calgary.ca/opendata/Pages/DatasetListingAlphabetical.aspx) and import all RSS feeds and then proceed to download all KMZ files, convert them to GeoJSON and add them into the database.

## Endpoints

The following API endpoints are available:

### GET /catalogue

The open data catalogue data parsed from the RSS feed.

### GET /points

Returns a list of points imported from all datasets. Can be filtered by property, e.g.
`GET /points?COMM=<code>` will return all points with that community code.
Additionally takes `location=latitude,longitude` and `radius=meters` query parameters which will search for all points around the location within the given radius.

### GET /polygons

Returns a GeoJSON list of polygons.
