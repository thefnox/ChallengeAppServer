/**
 * Created by kamai on 5/4/2017.
 */
module.exports = function (app) {
  // Generic error handler used by all endpoints.
  function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
  }

  // Root routing
  var controller = require('../controllers/search.server.controller');
  app.route('/api/search/tag').get(controller.searchTags);

  app.route('/api/search/user').get(controller.searchUser);
}
