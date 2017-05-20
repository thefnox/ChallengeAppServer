'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Single user routes
  app.route('/api/user/:userId')
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  app.route('/api/user/:userId/comments')
    .get(adminPolicy.isAllowed, admin.comments);

  app.route('/api/user/:userId/reports')
    .get(adminPolicy.isAllowed, admin.reports);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
