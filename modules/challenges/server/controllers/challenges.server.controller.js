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
  getDuration = require('get-video-duration'),
  checksum = require('checksum'),
  validator = require('validator');

exports.postByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  Challenge.findOne({
    _id: id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load Challenge ' + id));
    }

    req.profile = user;
    next();
  });
};

exports.commentByID = function (req, res, next, id) {

}


/**
 * Update user details
 */
exports.getUserPosts = function (req, res) {
  var user = req.user;

  if (user) {

  }

};

exports.createPost = function (req, res) {
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
      cb(null, id + "." + file.originalname.split('.').pop());
    }
  });
  var upload = multer({storage: storage}).single('content');
  upload.fileFilter = contentUploadFileFilter;
  upload.limit = settings.limits;
  if (user) {
    doTheUpload()
    .then(checkDescription)
    .then(checkHashtags)
    .then(verifyChecksum)
    .then(addExtraInfo)
    .then(function(post, req, res){
      res.json(post);
      //Actually save the post to the db with its final info
      post.save(function (err, thepost) {
      });
    })
    .catch(function (err) {
      //Upload error
      res.status(422).send(err);
    });
  }
  else
  {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function doTheUpload(){
    return new Promise(function (resolve, reject) {
      //Do the actual uploading
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function checkDescription(){
    return new Promise(function (resolve, reject) {
      var desc = req.body.description;
      //Description must exist and must be between 1 and 140 characters long
      if (desc && desc.length > 0 && desc.length <= 140 ){
        post.description = desc;
        resolve();
      }
      else{
        reject("Description must be between 1 and 140 characters long.");
      }
    });
  }

  function checkHashtags(){
    return new Promise(function (resolve, reject) {
      var hashtags = post.description.match(/\B#\w*[a-zA-Z]+\w*/);
      //Post must have at least one hashtag
      if (hashtags.length > 0) {
        post.tags = hashtags;
        resolve();
      }
      else
      {
        reject("Post must have at least one hashtag.");
      }
    });
  }

  function verifyChecksum(){
    return new Promise(function (resolve, reject){
      post.content.isImage = req.file.mimetype !== "video/mp4";
      post.content.size = req.file.size;
      post.content.filePath = req.file.path;
      post.content.staticURL = settings.dest + req.file.filename;
      //Get the content checksum
      checksum.file(post.content.filePath, function (err, sum) {
        if (err) {
          reject(err);
        }
        else {
          //Check that the checksum doesn't already exist
          Challenge.findOne({
            content: {
              checksum: sum
            }
          }, function (err, post) {
            if (err || post) {
              //Content is not unique
              reject("Post must have unique content!");
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

  function addExtraInfo(){
    return new Promise(function (resolve, reject){
      post.content.isImage = req.file.mimetype !== "video/mp4";
      post.content.size = req.file.size;
      post.content.filePath = req.file.path;
      post.content.staticURL = settings.dest + req.file.filename;
      if (post.content.isImage) {
        //It's an image, so we're done
        resolve();
      }
      else {
        //Since it's a video, we have to get its duration
        getDuration(post.content.filePath).then(function (duration) {
          post.content.duration = duration;
          resolve();
        });
      }
    });
  }

};

exports.getPost = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.deletePost = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.updatePost = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.createComment = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.deleteComment = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.editComment = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.likePost = function (req, res) {
  var user = req.user;

  if (user) {

  }
};

exports.viewPost = function (req, res) {
  var user = req.user;

  if (user) {

  }
};
