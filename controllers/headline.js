//headlines CONTROLLER
var db = require("../models");

module.exports = {
  // finds headlines, sorts date, sends to the user
  findAll: function (req, res) {
    db.Headline
      .find(req.query)
      .sort({
        date: -1
      })
      .then(function (dbHeadline) {
        res.json(dbHeadline);
      });
  },
  // delete specified headline
  delete: function (req, res) {
    db.Headline.remove({
      _id: req.params.id
    }).then(function (dbHeadline) {
      res.json(dbHeadline);
    });
  },
  // update specified headline
  update: function (req, res) {
    db.Headline.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: req.body
    }, {
      new: true
    }).then(function (dbHeadline) {
      res.json(dbHeadline);
    });
  }
};
