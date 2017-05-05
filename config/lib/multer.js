'use strict';

module.exports.profileUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

module.exports.contentUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpg') {
    return cb(new Error('Only JPEG or MP4 files are allowed!'), false);
  }
  cb(null, true);
};
