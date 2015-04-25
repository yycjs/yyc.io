import { crawl } from './catalogue';
import schedule from 'node-schedule';
import Q from 'q';

export default function() {
  return function() {
    let app = this;

    function runCrawler() {
      // Run the crawler
      crawl(app.get('catalogue')).then(items => {
        // Get the catalogue service
        let service = app.service('catalogue');

        // Add each item
        return Q.all(items.map(item => {
          // Find the item based on its dataset_id
          return Q.ninvoke(service, 'find', { dataset_id: item.dataset_id })
            .then(dbEntries => {
              let dbItem = dbEntries[0];

              if (!dbItem) { // If not in database
                // Create a new one
                return Q.ninvoke(service, 'create', item, {})
                  .then(data => app.info(`Created catalogue entry ${data._id}`));
              } else if (dbItem.date === item.date) { // If not up to date
                // Replaces the entire item with the new one
                return Q.ninvoke(service, 'update', dbItem._id.toString(), item, {})
                  .then(data => app.info(`Updated catalogue entry ${data._id}`));
              }
            });
        }));
      }).fail(error => app.error(error.stack));
    }

    // Schedule the crawler to run at midnight once a day
    schedule.scheduleJob('0 0 * * *', runCrawler);

    // Also run the crawler right away (this is at startup)
    runCrawler();
  }
}
