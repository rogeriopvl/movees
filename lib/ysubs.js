var request = require('request');
var unzip = require('unzip');
var fs = require('fs');

const API_BASE_URL = 'http://api.yifysubtitles.com/subs/';
const SUBS_DOWNLOAD_URL = 'http://www.yifysubtitles.com/';

/**
 * Get available subtitles for given movie
 */
exports.getSubtitles = function (imdbID, cb) {
  request(API_BASE_URL + imdbID, function (err, resp, body) {
    if(body.indexOf("<") > -1 || JSON.parse(body).subs === undefined) {
      cb(new Error('No subtitles'));
    }
    else {
      cb(null, JSON.parse(body).subs[imdbID]);
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
