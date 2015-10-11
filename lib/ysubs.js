var request = require('request');
var unzip = require('unzip');
var fs = require('fs');
var _max = require('lodash.max');

const API_BASE_URL = 'http://api.yifysubtitles.com/subs/';
const SUBS_DOWNLOAD_URL = 'http://www.yifysubtitles.com/';

/**
 * Get available subtitles for given movie
 */
exports.getSubtitle = function (imdbID, lang, cb) {
  request({ url: API_BASE_URL + imdbID, json: true, method: 'GET' }, function (err, resp, data) {
    if(err || resp.statusCode >= 400 || !data || !data.success) {
      cb(err);
    }
    else {
      return cb(null, _max(data.subs[imdbID][lang], 'rating').url);
    }
  });
};

/**
 * Fetches and unzips a subtitle file
 */
exports.fetchSubtitle = function (URLPath, savePath, cb) {
  var url = SUBS_DOWNLOAD_URL + URLPath;
  request.get(url, { encoding: null })
    .on('error', function (err) {
      return cb(err);
    })
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
      if (entry.path.indexOf('.srt') !== -1) {
        entry.pipe(fs.createWriteStream(savePath))
      } else {
        entry.autodrain();
      }
    })
    .on('error', function (err) {
      return cb(err);
    });
};
