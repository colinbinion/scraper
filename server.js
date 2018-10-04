// require dependencies
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// set port to be either the host's designated port, or 3000
var PORT = process.env.PORT || 3000;

// instantiate our Express App
var app = express();

// Require our routes
var routes = require("./routes");

// parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// make public a static folder
app.use(express.static("public"));

// connect handlebars to our express app
app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// have requests go through route middleware
app.use(routes);

// deployed, use deployed database... use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "#";

// connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// listen on the port
app.listen(PORT, function () {
  console.log("Listening on port: " + PORT);
});
