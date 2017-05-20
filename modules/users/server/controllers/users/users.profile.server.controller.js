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

var whitelistedFields = ['firstName', 'lastName', 'email', 'username'];

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  if (user) {
    // Update whitelisted fields only
    user = _.extend(user, _.pick(req.body, whitelistedFields));

    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.getUserPosts = function (req, res) {
  var user = req.profile;

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
  else{
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

};

exports.follow = function(req, res) {
  var other = req.profile;
  var user = req.user;
  var subbed = false;

  if (user && other && user._id.equals(other._id)) {
    res.status(422).send({
      message: "Can't follow yourself!"
    });
  }
  else if (user) {
    if (other) {
      user.following.forEach((elem, index) => {
        if (elem.equals(other._id)){
          subbed = index;
        }
      });
      if (subbed) {
        // Unfollow
        user.following.splice(subbed, 1);
      }
      else {
        // Follow
        user.following.push(other);
      }
      other.save(function (err, __) {
        user.save(function (err, theuser) {
          if (err) {
            res.status(422).send();
          }
          else {
            res.json(theuser.following);
          }
        });
      });
    }
    else {
      res.status(404);
    }
  }
  else{
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
}

exports.getFollowing = function(req, res){
  var user = req.profile ? req.profile : req.user;

  if (user){
    user.populate({
      path: 'following',
    }, function(err, theuser){
      if (!err) {
        res.json(theuser.following);
      }
      else{
        res.status(422).send();
      }
    });
  }
  else{
    res.status(404).send();
  }
}

exports.getFollowers = function(req, res){
  var user = req.profile ? req.profile : req.user;

  if (user){
    user.followers( function(err, users){
      if (!err) {
        res.json(users);
      }
      else{
        res.status(422).send();
      }
    });
  }
  else{
    res.status(404).send();
  }
}

exports.getUser = function(req, res){
  var user = req.profile;

  if (user){
    res.json(req.profile.sanitize());
  }
  else{
    res.status(404).send();
  }
}

exports.deleteSelf = function(req, res){
  var user = req.user;
  if (user){
    user.remove();
    req.logout();
    res.status(200).send();
  }
  else{
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
}

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var existingImageUrl;
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  var upload;
  var settings = config.uploads.profileUpload;

  if (user) {
    var id = req.user.id;
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, settings.dest);
      },
      filename: function (req, file, cb) {
        cb(null, id + "." + file.originalname.split('.').pop());
      }
    });
    profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
    upload = multer({storage: storage}).single('newProfilePicture');

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;
    upload.limit = settings.limits;
    existingImageUrl = user.profileImageURL;
    uploadImage()
      .then(updateUser)
      .then(deleteOldImage)
      .then(login)
      .then(function () {
        res.json(user);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser () {
    return new Promise(function (resolve, reject) {
      user.profileImageURL = (settings.dest.replace(/\.\/public/gi, '')) + req.file.filename;
      user.save(function (err, theuser) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteOldImage () {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  }

  function login () {
    return new Promise(function (resolve, reject) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          resolve();
        }
      });
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  // Sanitize the user - short term solution. Copied from core.server.controller.js
  // TODO create proper passport mock: See https://gist.github.com/mweibel/5219403
  var safeUserObject = null;
  if (req.user) {
    safeUserObject = req.user.sanitize();
  }

  res.json(safeUserObject || null);
};
