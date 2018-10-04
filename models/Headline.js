// headline MODEL
// require mongoose
var mongoose = require("mongoose");

// create schema class using mongoose
var Schema = mongoose.Schema;

// create headlineSchema with schema class
var headlineSchema = new Schema({
  // headline, is a string
  headline: {
    type: String,
    required: true,
    unique: {
      index: {
        unique: true
      }
    }
  },
  // summary, is a string
  summary: {
    type: String,
    required: true
  },
  // url, is a string
  url: {
    type: String,
    required: true
  },
  // date is a string
  date: {
    type: Date,
    default: Date.now
  },
  saved: {
    type: Boolean,
    default: false
  }
});

// create headline MODEL using headlineSchema
var Headline = mongoose.model("Headline", headlineSchema);

// export headline model
module.exports = Headline;
