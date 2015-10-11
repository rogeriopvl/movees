var test = require('tape');
var nock = require('nock');
var Ysubs = require('../lib/ysubs.js');

const API_BASE_URL = 'http://api.yifysubtitles.com';
const SUBS_DOWNLOAD_URL = 'http://www.yifysubtitles.com';

var someMovieID = 'tt0816692';
var fakeResponse = {
  success: true,
  subtitles: 10,
  subs: {
    tt0816692: {
      english: [
        {
          id: 42249,
          hi: 0,
          rating: 1,
          url: '/subtitle-api/interstellar-yify-42249.zip'
        },
        {
          id: 42336,
          hi: 1,
          rating: 3,
          url: '/subtitle-api/interstellar-yify-42336.zip'
        },
        {
          id: 61259,
          hi: 0,
          rating: 0,
          url: '/subtitle-api/interstellar-yify-61259.zip'
        }
      ]
    }
  }
};

test('Makes correct request for subtitle and returns highest rated', function (t) {
  t.plan(3);

  nock(API_BASE_URL)
    .get('/subs/' + someMovieID)
    .reply(200, fakeResponse);

  Ysubs.getSubtitle(someMovieID, 'english', function (err, data) {
    t.notOk(err);
    t.equal(typeof data, 'string');
    t.equal(data, '/subtitle-api/interstellar-yify-42336.zip');
  });
});

// test('Returns highest rated sub', function (t) {});
