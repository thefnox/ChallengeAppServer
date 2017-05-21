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
  Report = mongoose.model('Report'),
  getDuration = require('get-video-duration'),
  checksum = require('checksum'),
  validator = require('validator');

exports.markAsRead = function(req, res){
  var report = req.model;

  Report.findByIdAndUpdate(report.id, {
    seen: true
  });

  res.status(200).send();
};

exports.getPostReports = function(req, res) {
  var post = req.post;

  Report.find({
    post: post,
    seen: false
  })
  .exec(function (err, reports) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(reports);
  });
};


exports.getAllReports = function(req, res){

  Report
  .find({})
  .sort({
    created: -1
  })
  .exec(function (err, reports) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(reports);
  });
};


exports.reportByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  Report.findOne(id).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load report ' + id));
    }

    req.model = user;
    next();
  });
};
