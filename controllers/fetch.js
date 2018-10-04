// scraper CONTROLLER
var db = require("../models");
var scrape = require("../scripts/scrape");

module.exports = {
  scrapeHeadlines: function (req, res) {
    // scrape site
    return scrape()
      .then(function (articles) {
        // inserts articles into the DB
        return db.Headline.create(articles);
      })
      .then(function (dbHeadline) {
        if (dbHeadline.length === 0) {
          res.json({
            message: "No new articles today. Check back tomorrow!"
          });
        } else {
          // ... or send back count of number of new articles
          res.json({
            message: "Added " + dbHeadline.length + " new articles!"
          });
        }
      })
      .catch(function (err) {
        // this won't insert articles with duplicate headlines. it will error after inserting the others
        res.json({
          message: "Scrape complete!!"
        });
      });
  }
};
