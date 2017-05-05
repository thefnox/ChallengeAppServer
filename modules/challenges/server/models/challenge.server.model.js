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
    checksum: {
      type: String
    },
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
    }
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
    },
    updated: {
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

ChallengeSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  var _this = this;
  var possibleUsername = username.toLowerCase() + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};


mongoose.model('Challenge', ChallengeSchema);
