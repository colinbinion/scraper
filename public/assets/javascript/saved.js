/* global boot */
$(document).ready(function () {
  // getting a reference to the article container div we will be rendering all articles inside of
  var articleContainer = $(".article-container");
  // adding event listeners dynamically generated buttons deleting articles, pulling up article notes, saving article notes, deleting article notes
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);
  $(".clear").on("click", handleArticleClear);

  function initPage() {
    // empty the article container, run AJAX request for any saved headlines
    $.get("/api/headlines?saved=true").then(function (data) {
      articleContainer.empty();
      // render headlines to DOM
      if (data && data.length) {
        renderArticles(data);
      } else {
        // or render message "we have no articles"
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // function handles appending HTML containing our article data to the page
    // passed array of JSON containing all available articles in our database
    var articleCards = [];
    // pass each article JSON object to the createCard function which returns a bootstrap card with our article data inside
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }
    // we have the HTML for articles stored in articleCards array, appends to the articleCards container
    articleContainer.append(articleCards);
  }

  function createCard(article) {
    // function takes in a single JSON object for an article/headline constructing a jQuery element containing all of formatted HTML for article card
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
        .attr("href", article.url)
        .text(article.headline),
        $("<a class='btn btn-danger delete'>Delete From Saved</a>"),
        $("<a class='btn btn-info notes'>Article Notes</a>")
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.summary);

    card.append(cardHeader, cardBody);

    // attach the article's id to the jQuery element
    // use this to figure out which article the user wants to remove or open notes for
    card.data("_id", article._id);
    // returns the constructed card jQuery element
    return card;
  }

  function renderEmpty() {
    // function renders some HTML to DOM explaining "we don't have any articles"
    // using a joined array of HTML string data, easier to read/change than a concatenated string
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // appending this data to the DOM
    articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {
    // function handles rendering note list items to notes modal
    // sets up an array of notes to render after finished
    // sets up a currentNote variable to temporarily store each note
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      // display a message "no notes"
      currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
      notesToRender.push(currentNote);
    } else {
      // ...or, go through each one
      for (var i = 0; i < data.notes.length; i++) {
        // constructs an li element to contain our noteText and delete button
        currentNote = $("<li class='list-group-item note'>")
          .text(data.notes[i].noteText)
          .append($("<button class='btn btn-danger note-delete'>x</button>"));
        // stores note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // adds our currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    // appends the notesToRender to note-container inside note modal
    $(".note-container").append(notesToRender);
  }

  function handleArticleDelete() {
    // function handles deleting articles/headlines
    // grabs the id of article to delete from card element delete button sits inside
    var articleToDelete = $(this)
      .parents(".card")
      .data();

    // remove card from DOM
    $(this)
      .parents(".card")
      .remove();
    // uses delete method to be semantic
    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function (data) {
      // run initPage again which re-renders list of saved articles
      if (data.ok) {
        initPage();
      }
    });
  }

  function handleArticleNotes(event) {
    // function handles opening the notes modal and displaying our notes
    // grabs id of the article to get notes for from the card element delete button sits inside
    var currentArticle = $(this)
      .parents(".card")
      .data();
    // grabs any notes with headline/article id
    $.get("/api/notes/" + currentArticle._id).then(function (data) {
      // Constructing our initial HTML to add to the notes modal
      var modalText = $("<div class='container-fluid text-center'>").append(
        $("<h4>").text("Notes For Article: " + currentArticle._id),
        $("<hr>"),
        $("<ul class='list-group note-container'>"),
        $("<textarea placeholder='New Note' rows='4' cols='60'>"),
        $("<button class='btn btn-success save'>Save Note</button>")
      );
      // adds formatted HTML to the note modal
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      // adds some information about the article and article notes to the save button for easy access when trying to add new note
      $(".btn.save").data("article", noteData);
      // renderNotesList populate actual note HTML inside of the modal we just created/opened
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    // function handles what happens when user tries to save new note for article
    // setting variable to hold some formatted data about note, grabbing the note typed into the input box
    var noteData;
    var newNote = $(".bootbox-body textarea")
      .val()
      .trim();
    // data typed into the note input field, format it and post it to the "/api/notes" route and send the formatted noteData as well
    if (newNote) {
      noteData = {
        _headlineId: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData).then(function () {
        // complete, close the modal
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    // function handles the deletion of notes
    // grab the id of note to delete
    // store data on delete button when created
    var noteToDelete = $(this).data("_id");
    // DELETE request to "/api/notes/" with the id of the note, deleting as parameter
    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function () {
      // hide the modal
      bootbox.hideAll();
    });
  }

  function handleArticleClear() {
    $.get("api/clear")
      .then(function () {
        articleContainer.empty();
        initPage();
      });
  }
});
