/* global boot */
$(document).ready(function () {
  // setting reference to the article-container div where all the dynamic content will end up adding event listeners to any dynamically generated "save article" and "scrape new article" buttons
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);
  $(".clear").on("click", handleArticleClear);

  function initPage() {
    // run AJAX request for any unsaved headlines
    $.get("/api/headlines?saved=false").then(function (data) {
      articleContainer.empty();
      // render headlines to DOM
      if (data && data.length) {
        renderArticles(data);
      } else {
        // or render a message "no articles"
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // function handles appending HTML containing our article data to the page
    // passed an array of JSON containing all available articles in our database
    var articleCards = [];
    // pass each article JSON object to the createCard function which returns a BS card with article data inside
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }
    // we have the HTML for articles stored in articleCards array, appends to the articleCards container
    articleContainer.append(articleCards);
  }

  function createCard(article) {
    // function takes in a single JSON object for article/headline
    // it constructs jQuery element containing the formatted HTML for article card
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
        .attr("href", article.url)
        .text(article.headline),
        $("<a class='btn btn-success save'>Save Article</a>")
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.summary);

    card.append(cardHeader, cardBody);
    // attaches the article id to the jQuery element
    // use article id to figure out which article user wants to save
    card.data("_id", article._id);
    // returns constructed card jQuery element
    return card;
  }

  function renderEmpty() {
    // function renders HTML to DOM "no articles to view"
    // using joined array of HTML string data because easier to read/change than concatenated string
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // append data to the page
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    // function triggered when user wants to save an article
    // when rendered article initially, a javascript object containing headline id is attached to element using the .data method. we retrieve it here
    var articleToSave = $(this)
      .parents(".card")
      .data();

    // removes card from DOM
    $(this)
      .parents(".card")
      .remove();

    articleToSave.saved = true;
    // using patch method to semantic update to existing record in our collection
    $.ajax({
      method: "PUT",
      url: "/api/headlines/" + articleToSave._id,
      data: articleToSave
    }).then(function (data) {
      // if data saved successfully
      if (data.saved) {
        // reload list of articles
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    // function handles user clicking any "scrape new article" buttons
    $.get("/api/fetch").then(function (data) {
      // if able to successfully scrape, compare the articles to those in collection, re-render articles on the DOM letting user know how many unique articles we were able to save
      initPage();
      bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
    });
  }

  function handleArticleClear() {
    $.get("api/clear").then(function () {
      articleContainer.empty();
      initPage();
    });
  }
});
