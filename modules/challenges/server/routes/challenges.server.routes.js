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

  var adminPolicy = require('../policies/admin.server.policy'),
    admin = require('../controllers/admin.server.controller');

  // Root routing
  var controller = require('../controllers/challenges.server.controller');
  var report = require('../controllers/report.server.controller');

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
  //Get winning posts
  app.route('/api/post/winning').get(controller.getWinningPosts);
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
  //Get tags
  app.route('/api/tags').get(controller.getPopularTags);
  //Report post
  app.route('/api/post/:post_id/report').post(controller.report);

  //admin routes
  app.route('/api/post/:post_id')
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  app.route('/api/post/:post_id/reports').get(adminPolicy.isAllowed, report.getPostReports);
  app.route('/api/report/:report_id').post(adminPolicy.isAllowed, report.markAsRead);


  app.param('post_id', controller.postByID);
  app.param('comment_id', controller.commentByID);
  app.param('report_id', report.reportByID);

};
