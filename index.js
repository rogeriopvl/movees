var argv = require('minimist')(process.argv.slice(2));
var Yts = require('./lib/yts.js');
var chalk = require('chalk');
var path = require('path');
var tmpdir = require('os-tmpdir');
var isOutdated = require('is-outdated');
var parseTorrent = require('parse-torrent');
var open = require('open');
var spawn = require('child_process').spawn;

var showRecentMovies = function (options) {
  options = options || {};
  options.sort_by = options.sort_by || 'year';
  options.order_by = options.order_by || 'desc';

  Yts.listMovies(options, function (err, res) {
    if (err) { console.log(err); }

    res.data.movies.forEach(function (movie) {
      console.log(chalk.underline.yellow(movie.id) + ': ' + movie.title_long);
    });
  });
};

var searchMovie = function (str) {
  Yts.listMovies({ query_term: str }, function (err, res) {
    if (err) { console.log(err); }

    if (res.data.movies.length < 1) {
      console.log('No movies found');
    } else {
      res.data.movies.forEach(function (movie) {
        console.log(chalk.underline.yellow(movie.id) + ': ' + movie.title_long);
      });
    }
  });
};

var getInfo = function (movieID) {
  Yts.movieDetails({ movie_id: movieID }, function (err, res) {
    if (err) { return console.log(err); }
    console.log('Opening browser with movie info...');
    open(res.data.url);
  });
}

var getMovie = function (movieID, quality, subs) {
  quality = quality || '720p';
  subs = subs || 'english';
  var YSubs = require('./lib/ysubs.js');


  Yts.movieDetails({ movie_id: movieID }, function (err, res) {
    if (res.status === 'error') {
      return console.log(chalk.red(res.status_message));
    }

    var subsSavePath = path.join(tmpdir(), res.data.slug + '.srt');

    var torrInfo = res.data.torrents.filter(function (torr) {
      return torr.quality === quality;
    }).pop();
    parseTorrent.remote(torrInfo.url, function (err, tinfo) {
      var magnetURI = parseTorrent.toMagnetURI(tinfo);

      var peerflixPath = path.join(__dirname, 'node_modules', '.bin', 'peerflix');
      var peerflix = spawn(peerflixPath, [
        '-t',
        subsSavePath,
        magnetURI,
        '--vlc'
      ]);

      peerflix.stdout.on('data', function (data) {
        process.stdout.write(data);
      });

      peerflix.stderr.on('data', function (data) {
        process.stdout.write(data);
      });
    });

    YSubs.getSubtitles(res.data.imdb_code, function (err, data) {
      if (!data || !data[subs]) {
        return console.log('No subtitles available in %s', subs);
      }
      var zipPath = data[subs].shift().url;
      YSubs.fetchSubtitle(zipPath, subsSavePath, function (err, data) {
        if (err) { console.log(err); }
      });
    });
  })
};


var showHelp = function () {
  console.log('movees [options]');
  console.log('Options:');
  console.log('--search <search term>  search for a movie');
  console.log('--info <movie id>  open web page with movie info');
  console.log('--watch <movie id> [--quality <720p|1080p|3d> [--subs <subtitle language>]   watch a movie');
  console.log('--latest [--page <page number>] [--limit <number of movies p/page>]  show latest movies available');
  console.log('--version  show version');
  console.log('--help     show usage help');
};

var showVersion = function () {
  var version = require('./package.json').version;
  console.log('Movees (version %s)', version);
};

var checkForUpdates = function () {
  var currentVersion = require('./package.json').version;
  isOutdated('movees', currentVersion, function (err, res) {
    if (res) {
      console.log('\n----------------------------------------');
      console.log(chalk.bold('** UPDATE AVAILABLE **'));
      console.log(chalk.underline('New version:') + ' ' + chalk.green(res.version));
      console.log(chalk.underline('Current version:') + ' ' + chalk.red(currentVersion));
      console.log('\nPlease update with: npm update -g movees');
      console.log('----------------------------------------\n');
    }
  });
};

/**
 * CLI arguments handling
 */

// avoid calling npm when testing
if (!argv.test) {
  checkForUpdates();
}

if (argv.search) {
  searchMovie(argv.search);
} else if (argv.watch) {
  getMovie(argv.watch, argv.quality, argv.subs);
} else if (argv.info) {
  getInfo(argv.info);
} else if (argv.latest) {
  var opts = {};
  opts.page = argv.page || 1;
  opts.limit = argv.limit || '20';
  showRecentMovies(opts);
} else if (argv.version) {
  showVersion();
} else {
  showHelp();
}
