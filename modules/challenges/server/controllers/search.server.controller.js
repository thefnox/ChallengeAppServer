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
  Content = mongoose.model('Content'),
  validator = require('validator');
