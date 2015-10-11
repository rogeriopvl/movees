var Yts = require('./lib/yts.js');
var YSubs = require('./lib/ysubs.js');
var chalk = require('chalk');
var path = require('path');
var tmpdir = require('os-tmpdir');
var isOutdated = require('is-outdated');
var Configstore = require('configstore');
var pkg = require('./package.json');
var parseTorrent = require('parse-torrent');
var open = require('open');
var validURL = require('valid-url');
var spawn = require('child_process').spawn;

var Conf = new Configstore(pkg.name, {
  lastUpdate: Date.now(),
  lastVersion: pkg.version
});

var showRecentMovies = function (options) {
  options = options || {};
  options.sort_by = options.sort_by || 'year';
  options.order_by = options.order_by || 'desc';

  Yts.listMovies(options, function (err, res) {
    if (err) { console.log(err); }

    res.data.movies.forEach(function (movie) {
      console.log(chalk.underline.yellow(movie.id) + ' : ' + movie.title_long);
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

    if (res.status === 'error') {
      return console.log(chalk.red(res.status_message));
    }

    console.log('Opening browser with movie info...');
    if (validURL.isWebUri(res.data.url)) {
      open(res.data.url);
    } else {
      console.log(chalk.yellow('Movie has invalid URL'));
    }
  });
}

var getMovie = function (movieID, quality, subs) {
  quality = quality || '720p';

  Yts.movieDetails({ movie_id: movieID }, function (err, res) {
    if (res.status === 'error') {
      return console.log(chalk.red(res.status_message));
    }

    if (!res.data.torrents || res.data.torrents.length === 0) {
      return console.log(chalk.red('Movie has no torrents available'));
    }

    if (res.data.torrents.length === 1) {
      quality = res.data.torrents[0].quality;
      console.log(chalk.yellow('Using ' + quality));
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

    if (subs) {
      YSubs.getSubtitles(res.data.imdb_code, function (err, data) {
        if (!data || !data[subs]) {
          return console.log('No subtitles available in %s', subs);
        }
        var zipPath = data[subs].shift().url;
        YSubs.fetchSubtitle(zipPath, subsSavePath, function (err, data) {
          if (err) { console.log(err); }
        });
      });
    }
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
  console.log('Movees (version %s)', pkg.version);
};

var showUpdateMsg = function (version) {
  console.log('\n----------------------------------------');
  console.log(chalk.bold('** UPDATE AVAILABLE **'));
  console.log(chalk.underline('New version:') + ' ' + chalk.green(version));
  console.log(chalk.underline('Current version:') + ' ' + chalk.red(pkg.version));
  console.log('\nPlease update with: npm update -g movees');
  console.log('----------------------------------------\n');
};

var checkForUpdates = function () {
  var lastUpdate = Conf.get('lastUpdate');
  var newVersion = Conf.get('newVersion');
  if ((Date.now() - lastUpdate) >= 432e6) { // 5 days
    isOutdated('movees', pkg.version, function (err, res) {
      if (res) {
        Conf.set('newVersion', res.version);
        showUpdateMsg(res.version);
      } else {
        Conf.del('newVersion');
      }
    });
    Conf.set('lastUpdate', Date.now());
  } else {
    // check if we had an update
    if (pkg.version !== Conf.get('lastVersion')) {
      Conf.set('lastVersion', pkg.version);
      Conf.del('newVersion');
      return;
    }
    if (newVersion) {
      showUpdateMsg(newVersion);
    }
  }
};

/**
 * CLI arguments handling
 */

// avoid calling npm when testing
module.exports = function (argv) {
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
};
