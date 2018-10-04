// note MODEL
// require mongoose
var mongoose = require("mongoose");
// create schema class using mongoose
var Schema = mongoose.Schema;

// create noteSchema to the schema object
var noteSchema = new Schema({
  // headline is article associate with note
  _headlineId: {
    type: Schema.Types.ObjectId,
    ref: "Headline"
  },
  // date is just a string
  date: {
    type: Date,
    default: Date.now
  },
  // noteText is a string
  noteText: String
});

// create Note model using noteSchema
var Note = mongoose.model("Note", noteSchema);

// export Note model
module.exports = Note;
