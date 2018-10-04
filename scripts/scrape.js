// scrape script
// =============

// Require axios and cheerio, making our scrapes possible
var axios = require("axios");
var cheerio = require("cheerio");

// This function will scrape the NYTimes website
var scrape = function () {
  // Scrape the NYTimes website
  return axios.get("http://www.nytimes.com").then(function (res) {
    var $ = cheerio.load(res.data);
    // Make an empty array to save our article info
    var articles = [];

    // Now, find and loop through each element that has the "css-180b3ld" class
    // (i.e, the section holding the articles)
    $("article.css-180b3ld").each(function (i, element) {
      // In each article section, we grab the child with the class story-heading

      // Then we grab the inner text of the this element and store it
      // to the head variable. This is the article headline
      var head = $(this)
        .find("h2")
        .text()
        .trim();

      // Grabs URL of article
      var url = $(this)
        .find("a")
        .attr("href");

      // grabs any children with class of summary and grabs inner text, storeing to sum variable. this is article summary
      var sum = $(this)
        .find("p")
        .text()
        .trim();

      // headline and sum and url aren't empty or undefined, do.
      if (head && sum && url) {
        // section uses regular expressions and trim function for headlines and summaries
        // removing extra lines, extra spacing, extra tabs, etc.. increaseing typographical cleanliness.
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        // initialize object to push to articles array

        var dataToAdd = {
          headline: headNeat,
          summary: sumNeat,
          url: "https://www.nytimes.com" + url
        };

        articles.push(dataToAdd);
      }
    });
    return articles;
  });
};

// Exports function, so backend can use it
module.exports = scrape;
