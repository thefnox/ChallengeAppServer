'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/user/me').get(users.me);
  app.route('/api/user/:userId').get(users.getUser);
  app.route('/api/user/:userId/posts').get(users.getUserPosts);
  app.route('/api/user/:userId/followers').get(users.getFollowers);
  app.route('/api/user/:userId/following').get(users.getFollowing);
  app.route('/api/user/:userId/follow').get(users.follow);
  app.route('/api/user').put(users.update);
  app.route('/api/user/followers').get(users.getFollowers);
  app.route('/api/user/following').get(users.getFollowing);
  app.route('/api/user/password').post(users.changePassword);
  app.route('/api/user/picture').post(users.changeProfilePicture);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
