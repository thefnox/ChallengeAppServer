'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Report = mongoose.model('Report'),
  Challenge = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.update = function (req, res) {
  var post = req.post;

  post.dailyLikes = (req.body.dailyLikes ? req.body.dailyLikes : post.dailyLikes);
  post.dailyViews = (req.body.dailyViews ? req.body.dailyViews : post.dailyViews);
  post.views = (req.body.views ? req.body.views : post.views);
  if (req.body.description){
    post.description = req.body.description;
    var hashtags = post.description.match(/\B#\w*[a-zA-Z]+\w*/gi);
    //Post must have at least one hashtag
    if (hashtags.length > 0) {
      post.tags = [];
      hashtags.forEach((tag) => {
        post.tags.push({
          name: tag.toLowerCase()
        });
      });
      post.save(function (err, thepost) {
        if (!err) {
          post.tags.forEach((tag) => {
            Challenge.calculateRanking(tag.name, function () {

            });
          });
          res.json(post);
        }
      });
    }
    else
    {
      return res.status(422).send({
        message: 'Post must have at least one hashtag.'
      });
    }
  }
  else{
    post.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.json(post);
    });
  }
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var post = req.post;

  post.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(post);
  });
};

