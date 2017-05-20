var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  validator = require('validator');

var ReportSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  post: {
    type: Schema.ObjectId,
    ref: 'Challenge'
  },
  type: {
    type: String
  },
  description: {
    type: String
  },
  seen: {
    type: Boolean,
    default: false
  },
});


mongoose.model('Report', ReportSchema);
