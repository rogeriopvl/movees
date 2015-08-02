var test = require('tape');
var path = require('path');
var concat = require('concat-stream');
var spawn = require('child_process').spawn;

var binPath = path.join(__dirname, '..', 'bin', 'movees');

var runBin = function (params, cb) {
  var defaultParams = ['--test']; // need this to avoid checking for updates
  var proc = spawn(binPath, defaultParams.concat(params));
  proc.stdout.pipe(concat(function (output) {
    var o = output.toString('utf8');

    proc.on('close', function (code) {
      return cb(null, o, code);
    });
  }));
};

test('calling with no arguments returns usage and 0 status code', function (t) {
  t.plan(2);
  runBin([], function (err, output, code) {
    t.ok(output.indexOf('Options:') !== -1);
    t.equals(code, 0);
  });
});

test('calling with --version returns version and 0 status code', function (t) {
  t.plan(2);
  runBin(['--version'], function (err, output, code) {
    var expected = 'Movees (version ' + require('../package.json').version + ')\n';
    t.equals(output, expected);
    t.equals(code, 0);
  });
});
