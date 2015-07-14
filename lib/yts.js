'use strict';

var request = require('request');
var baseUrl = 'https://yts.to/api/v2/';

var doRequest = function (url, options, callback) {
    request({url: url, qs: options}, function (err, res, body) {
        if (!err && res.statusCode === 200) {
            var json = JSON.parse(body);
            callback(null, json);
        } else {
            callback(err, null);
        }
    });
};

exports.listMovies = function (options, callback) {
    doRequest(baseUrl + "list_movies.json", options, callback);
};

exports.movieDetails = function (options, callback) {
    doRequest(baseUrl + "movie_details.json", options, callback);
};

exports.movieSuggestions = function (options, callback) {
    doRequest(baseUrl + "movie_suggestions.json", options, callback);
};

exports.movieComments = function (options, callback) {
    doRequest(baseUrl + "movie_comments.json", options, callback);
};

exports.movieReviews = function (options, callback) {
    doRequest(baseUrl + "movie_reviews.json", options, callback);
};

exports.movieParentalGuides = function (options, callback) {
    doRequest(baseUrl + "movie_parental_guides.json", options, callback);
};

exports.listUpcoming = function (options, callback) {
    doRequest(baseUrl + "list_upcoming.json", options, callback);
};
