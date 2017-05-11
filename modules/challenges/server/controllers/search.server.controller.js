/**
 * Created by kamai on 5/4/2017.
 */
'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Challenge = mongoose.model('Challenge'),
  validator = require('validator');

exports.searchTags = function (req, res) {
  var user = req.user;
  var tag = req.query.s;

  if (!tag){
    res.status(422).send({
      message : "Argument for search is 's'!"
    });
  }
  else if (user) {
    Challenge.find({
      "tags.name": tag,
      deleted: false
    }).
    limit(100).
    exec(function (err, posts) {
      if (err) {
        res.status(422).send(err);
      }
      else if (posts)
      {
        return res.json(posts);
      }
      else
      {
        res.status(404).send();
      }
    });
  }
  else
  {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};


exports.searchUser = function (req, res) {
  var user = req.user;
  var name = req.query.s;

  if (!name){
    res.status(422).send({
      message : "Argument for search is 's'!"
    });
  }
  else if (user) {
    User.find({
      username: {
        $regex: (new RegExp( name, 'i'))
      }
    }).
    limit(100).
    exec(function (err, users) {
      if (err) {
        res.status(422).send(err);
      }
      else if (users)
      {
        return res.json(users);
      }
      else
      {
        res.status(404).send();
      }
    });
  }
  else
  {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};
