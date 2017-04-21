'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema;

var ContentSchema = new Schema({
  length: {
    type: Number
  },
  size: {
    type: Number
  },
  filePath: {
    type: String
  },
  staticURL: {
    type: String
  },
  image: {
    type: Boolean,
    default: false
  },
  updated: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Content', ContentSchema);
