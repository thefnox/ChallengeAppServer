/**
 * Created by kamai on 5/4/2017.
 */

'use strict';

module.exports = function (app) {
  // Generic error handler used by all endpoints.
  function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
  }

  // Root routing
  var controller = require('../controllers/challenges.server.controller');

  // Return a 404 for all undefined api, module or lib routes
  //Get user's posts
  app.route('/api/post').get(controller.getUserPosts);
  //Get newest posts
  app.route('/api/post/newest').get(controller.getNewestPosts);
  //Get daily posts
  app.route('/api/post/daily').get(controller.getDailyTopPosts);
  //Get popular posts
  app.route('/api/post/popular').get(controller.getMostPopularPosts);
  //Get followers posts
  app.route('/api/post/following').get(controller.getFollowingPosts);
  //Create new post
  app.route('/api/post').post(controller.createPost);
  //Get info about a specific post
  app.route('/api/post/:post_id').get(controller.getPost);
  //Delete own post
  app.route('/api/post/:post_id').delete(controller.deletePost);
  //Update post
  app.route('/api/post/:post_id').put(controller.updatePost);
  //Comment on post
  app.route('/api/post/:post_id/comment').post(controller.createComment);
  //Delete comment on post
  app.route('/api/post/:post_id/comment/:comment_id').delete(controller.deleteComment);
  //Edit comment on post
  app.route('/api/post/:post_id/comment/:comment_id').put(controller.editComment);
  //Like post
  app.route('/api/post/:post_id/like').get(controller.likePost);
  //View post
  app.route('/api/post/:post_id/view').get(controller.viewPost);


  app.param('post_id', controller.postByID);
  app.param('comment_id', controller.commentByID);

};
