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
  sharp = require('sharp'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Challenge = mongoose.model('Challenge'),
  Report = mongoose.model('Report'),
  getDuration = require('get-video-duration'),
  checksum = require('checksum'),
  validator = require('validator');

exports.postByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Post is invalid'
    });
  }

  Challenge.findOne({
    _id: id
  }).
  populate('comments.author', 'username _id profileImageURL').
  populate('author', 'username _id profileImageURL').
  exec(function (err, post) {
    req.post = post;
    next();
  });
};

exports.commentByID = function (req, res, next, id) {
  var post = req.post;

  if (post) {
    req.comment = post.comments.id(id);
  }
  next();
};

exports.getPopularTags = function(req, res) {
  var user = req.user;

  if (user) {
    Challenge.aggregate([
      { '$project': { 'tags':1 } },
      { '$unwind': '$tags' },
      { '$group': { '_id': '$tags.name', 'count': { '$sum': 1 } } }
    ])
    .limit(8)
    .sort({
      count: -1
    })
    .exec(function (err, posts) {
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

exports.getUserPosts = function (req, res) {
  var user = req.user;

  if (user) {
    Challenge.find({
      author: user,
      deleted: false
    })
      .populate('author', 'username _id profileImageURL')
      .exec(function (err, posts) {
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

exports.getWinningPosts = function (req, res) {
  var user = req.user;

  if (user) {
    Challenge.find({
      'tags.rank': 1,
      deleted: false
    })
      .sort({
        dailyLikes: -1,
        dailyViews: -1,
      })
      .populate('author', 'username _id profileImageURL')
      .exec(function (err, posts) {
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

exports.getNewestPosts = function(req, res) {
  var user = req.user;

  if (user) {
    Challenge.find({
      deleted: false
    }).
    populate('author', 'username _id profileImageURL').
    sort({
      created: -1,
    }).
    limit(10).
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

exports.getDailyTopPosts = function(req, res) {
  var user = req.user;

  if (user) {
    Challenge.find({
      deleted: false
    }).
    populate('author', 'username _id profileImageURL').
    sort({
      dailyLikes: -1,
      dailyViews: -1,
    }).
    limit(10).
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

exports.getFollowingPosts = function(req, res) {
  var user = req.user;
  var following = [];

  if (user) {
    user.following.forEach((elem) => {
      following.push(elem._id);
    });
    Challenge.find({
      deleted: false
    }).
    populate('author', 'username _id profileImageURL').
    sort({
      dailyLikes: -1,
      dailyViews: -1,
    }).
    where({
      author: {
        $in: user.following
      }
    }).
    limit(10).
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

exports.getMostPopularPosts = function(req, res) {
  var user = req.user;

  if (user) {
    Challenge.find({
      deleted: false
    }).
    populate('author', 'username _id profileImageURL').
    sort({
      views: -1,
    }).
    limit(10).
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

exports.createPost = function (req, res) {
  var image;
  var user = req.user;
  var settings = config.uploads.contentUpload;
  var contentUploadFileFilter = require(path.resolve('./config/lib/multer')).contentUploadFileFilter;
  var post = new Challenge({});
  var id = post.id;
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, settings.dest);
    },
    filename: function (req, file, cb) {
      cb(null, id + '_orig.' + file.originalname.split('.').pop());
    }
  });
  var upload = multer({ storage: storage }).single('content');
  upload.fileFilter = contentUploadFileFilter;
  upload.limit = settings.limits;
  if (user) {
    doTheUpload()
    .then(checkDescription)
    .then(checkHashtags)
    .then(verifyChecksum)
    .then(addExtraInfo)
    .then(getContentDuration)
    .then(function(data) {
      if (data){
        console.log(data);
      }
      if (post.content.isImage) {
        image = sharp(post.content.filePath)
        .metadata()
        .then(function(metadata){
          if (metadata) {
            var path = './public' + post.content.staticURL;
            return sharp(post.content.filePath)
              .resize(512, 512, {
                kernel: sharp.kernel.nearest,
                interpolator: sharp.interpolator.nohalo
              })
              .withoutEnlargement()
              .toFile(path);
          }
        })
        .then(function(data){

        })
        .catch(function(err){
          console.log(err);
        });
      }
      // Actually save the post to the db with its final info
      post.save(function (err, thepost) {
        if (err) {
          res.status(422).send(err);
        }
        else {
          res.json(thepost);
        }
      });
    })
    .catch(function (err) {
      // Upload error
      res.status(422).send(typeof(err) === 'string' ? err : err.message);
    });
  }
  else
  {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function doTheUpload() {
    return new Promise(function (resolve, reject) {
      // Do the actual uploading
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function checkDescription() {
    return new Promise(function (resolve, reject) {
      var desc = req.body.description;
      // Description must exist and must be between 1 and 140 characters long
      if (desc && desc.length > 0 && desc.length <= 140) {
        post.description = desc;
        resolve();
      }
      else {
        reject('Description must be between 1 and 140 characters long.');
      }
    });
  }

  function checkHashtags() {
    return new Promise(function (resolve, reject) {
      var hashtags = post.description.match(/\B#\w*[a-zA-Z]+\w*/gi);
      // Post must have at least one hashtag
      if (hashtags.length > 0 && hashtags.length <= 5) {
        post.tags = [];
        hashtags.forEach((tag) => {
          post.tags.push({
             name: tag.toLowerCase()
           });
          Challenge.calculateRanking(tag.toLowerCase(), function() {

          });
        });
        resolve();
      }
      else
      {
        reject('Post must have between 1 and 5 hashtags.');
      }
    });
  }

  function verifyChecksum() {
    return new Promise(function (resolve, reject) {
      post.content = {};
      // Get the content checksum
      checksum.file(req.file.path, function (err, sum) {
        if (err) {
          reject(err);
        }
        else {
          // Check that the checksum doesn't already exist
          Challenge.findOne({
            'content.checksum': sum,
            'deleted': false
          }, function (err, otherpost) {
            if (err || otherpost) {
              // Content is not unique
              reject('Post must have unique content!');
            }
            else {
              post.content.checksum = sum;
              resolve();
            }
          });
        }
      });
    });
  }

  function addExtraInfo() {
    return new Promise(function (resolve, reject) {
      // Remove ./public from url
      var folder = settings.dest.replace(/\.\/public/g, '');
      post.author = user;
      post.content.isImage = req.file.mimetype !== 'video/mp4';
      post.content.size = req.file.size;
      post.content.filePath = settings.dest + req.file.filename;
      if (post.content.isimage){
        post.content.staticURL = (folder + '/' + (req.file.filename.replace('_orig', '')));
      }
      else
      {
        post.content.staticURL = folder + '/' + req.file.filename;
      }
      resolve();
    });
  }

  function getContentDuration() {
    /*
    if (!post.content.isImage) {
      //Since it's a video, we have to get its duration
      return getDuration(post.content.filePath);
    }
    else{*/
    return new Promise(function (resolve, reject) {
        resolve();
      });
    // }
  }

};

exports.getPost = function (req, res) {
  var post = req.post;

  if (post && !post.deleted) {
    res.json(post);
  }
  else
  {
    res.status(404).send();
  }
};

exports.deletePost = function (req, res) {
  var user = req.user;
  var post = req.post;

  if (user) {
    if (post) {
      if (!post.author.equals(user._id)) {
        res.status(403).send({
          message: 'Not your challenge'
        });
      }
      else {
        post.deleted = true;
        post.save(function (err, thepost) {
          if (err) {
            res.status(422).send(err);
          }
          else {
            res.json(thepost);
          }
        });
      }
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.updatePost = function (req, res) {
  var user = req.user;
  var post = req.post;
  var upload = multer({}).none();
  upload(req, res, function (uploadError) {
    var desc = req.body.description;

    if (user) {
      if (post) {
        if (!post.author.equals(user._id)) {
          res.status(403).send({
            message: 'Not your challenge'
          });
        }
        else {
          // Description must exist and must be between 1 and 140 characters long
          if (desc && desc.length > 0 && desc.length <= 140) {
            post.description = desc;
            var hashtags = desc.match(/\B#\w*[a-zA-Z]+\w*/);
            // Post must have at least one hashtag
            if (hashtags && hashtags.length > 0) {
              post.tags = [];
              hashtags.forEach((tag) => {
                post.tags.push({
                  name: tag
                });
              });
              post.dailyLikes = 0;
              post.dailyViews = 0;
              // Actually save the post to the db with its final info
              post.save(function (err, thepost) {
                if (err) {
                  res.status(422).send(err);
                }
                else {
                  res.json(thepost);
                }
              });
            }
            else {
              res.status(422).send({
                message: 'Post must have at least one hashtag.'
              });
            }
          }
          else {
            res.status(422).send({
              message: 'Description must be between 1 and 140 characters long.'
            });
          }
        }
      }
      else {
        res.status(404).send();
      }
    }
    else {
      res.status(401).send({
        message: 'User is not signed in'
      });
    }
  });
};

exports.report = function(req, res) {
  var post = req.post;
  var user = req.user;

  if (user && post && user._id.equals(post.author._id)) {
    res.status(422).send({
      message: 'Can\'t report your own post!'
    });
  }
  else if (user) {
    if (post) {
      var report = new Report({
        author: user,
        post: post,
        description: req.body.description,
        type: req.body.type
      });
      report.save((err) => {
        res.json(report);
      });
    }
    else {
      res.status(404);
    }
  }
  else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.createComment = function (req, res) {
  var user = req.user;
  var post = req.post;
  var upload = multer({}).none();
  upload(req, res, function (uploadError) {
    var comment = req.body.comment;
    if (user) {
      if (post && !post.deleted) {
        if (comment && comment.length > 1 && comment.length < 140) {
          post.comments.push({
            author: user,
            text: comment
          });
          post.save(function (err, thepost) {
            if (err) {
              res.status(422).send(err);
            }
            else {
              res.json(thepost.comments);
            }
          });
        }
        else {
          res.status(422).send({
            message: 'Comment must be between 1 and 140 characters long.'
          });
        }
      }
      else {
        res.status(404).send();
      }
    }
    else {
      res.status(401).send({
        message: 'User is not signed in'
      });
    }
  });
};

exports.deleteComment = function (req, res) {
  var user = req.user;
  var post = req.post;
  var comment = req.comment;

  if (user) {
    if (post) {
      if (comment) {
        post.comments.id(comment._id).remove();
        post.save(function (err, thepost) {
          if (!err) {
            res.json(thepost.comments);
          }
          else {
            res.status(404).send();
          }
        });
      }
      else {
        res.status(404).send();
      }
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.editComment = function (req, res) {
  var user = req.user;
  var post = req.post;
  var comment = req.comment;
  var upload = multer({}).none();
  upload(req, res, function (uploadError) {
    if (user) {
      if (post) {
        if (comment) {
          post.comments.id(comment._id).text = req.body.comment;
          post.save(function (err, thepost) {
            if (!err) {
              res.json(thepost.comments);
            }
            else {
              res.status(404).send();
            }
          });
        }
        else {
          res.status(404).send();
        }
      }
      else {
        res.status(404).send();
      }
    }
    else {
      res.status(401).send({
        message: 'User is not signed in'
      });
    }
  });
};

exports.likePost = function (req, res) {
  var user = req.user;
  var post = req.post;

  if (user) {
    if (post) {
      var found = false;
      post.likes.forEach((element, index, list) => {
        if (element.equals(user._id)) {
          post.likes.splice(index, 1);
          post.dailyLikes--;
          post.save(function (err, thepost) {
            if (!err) {
              post.tags.forEach((tag) => {
                Challenge.calculateRanking(tag.name, function() {

                });
              });
              res.status(200).send({
                likes: thepost.likes
              });
            }
            else {
              res.status(404).send();
            }
          });
          found = true;
        }
      });
      if (!found) {
        if (!user._id.equals(post.author._id)) {
          post.likes.push(user);
          post.dailyLikes++;
        }
        post.save(function (err, thepost) {
          if (!err) {
            post.tags.forEach((tag) => {
              Challenge.calculateRanking(tag.name, function() {

              });
            });
            res.status(200).send({
              likes: thepost.likes
            });
          }
          else {
            res.status(404).send();
          }
        });
      }
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.viewPost = function (req, res) {
  var user = req.user;
  var post = req.post;

  if (user) {
    if (post) {
      if (!user._id.equals(post.author._id)) {
        post.views++;
        post.dailyViews++;
      }
      post.save(function (err, thepost) {
        if (!err) {
          res.status(200).send({
            views: post.views
          });
        }
        else {
          res.status(404).send();
        }
      });
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};
