'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  validator = require('validator');

var ChallengeSchema = new Schema({
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: [Schema.ObjectId],
    ref: 'User'
  },
  dailyViews: {
    type: Number,
    default: 0
  },
  dailyLikes: {
    type: Number,
    default: 0
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
  tags: [{
    name: {
      type: String
    },
    rank: {
      type: Number,
      default: 0
    }
  }],
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

ChallengeSchema.methods.sanitize = function(){
  return {
    _id: this._id,
    content: this.content,
    tags: this.tags,
    likes: this.likes.length,
    views: this.views,
    dailyLikes: this.dailyLikes,
    dailyViews: this.dailyViews,
    comments: this.comments,
    description: this.description,
    author: this.author,
    created: this.created
  };
}

ChallengeSchema.methods.compareRank = function(other){
  if (this.dailyLikes > other.dailyLikes || this.dailyViews > other.dailyViews || this.likes.length > other.likes.length || this.views > other.views || this.created > other.created) {
    return -1;
  } else if (this.dailyLikes === other.dailyLikes && this.dailyViews === other.dailyViews && this.likes.length === other.likes.length && this.views === other.views) {
    return 0;
  } else {
    return 1;
  }
}

ChallengeSchema.statics.calculateRanking = function(hashtag, cb) {
  this.find({
    "tags.name": hashtag
  }).
  sort({
    dailyLikes: -1
  }).
  limit(100).
  exec((err, posts) => {
    posts[0]._ranking = 1;
    posts.sort((a, b) => {
      return a.compareRank(b);
    });
    posts.forEach((elem, index) => {
      elem.tags.forEach((tag) => {
        if (tag.name === hashtag) tag.rank = index + 1;
      })
      elem.save();
    });
    cb();
  });
}

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
