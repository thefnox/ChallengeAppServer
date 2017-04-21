'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
  views: {
    type: Number
  },
  likes: {
    type: [Schema.ObjectId],
    ref: 'User'
  },
  dailyViews: {
    type: Number
  },
  dailyLikes: {
    type: Number
  },
  description: {
    type: String
  },
  content: {
    type: Schema.ObjectId,
    ref: 'Content'
  },
  comments: [{
    author: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    text: String,
    created: {
      type: Date,
      default: Date.now
    }
  }],
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
  },
  tags: {
    type: [String]
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Challenge', ChallengeSchema);
