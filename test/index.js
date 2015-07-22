var test = require('tape');
var path = require('path');
var concat = require('concat-stream');
var spawn = require('child_process').spawn;

var binPath = path.join(__dirname, '..', 'bin', 'movees');

// just a simple test to check if its running
test('calling with --version returns version and 0 status code', function (t) {
  t.plan(2);
  var proc = spawn(binPath, ['--version', '--test']);
  proc.stdout.pipe(concat(function (output) {
    var o = output.toString('utf8');
    var expected = 'Movees (version ' + require('../package.json').version + ')\n';
    t.equals(o, expected);
  }));

  proc.on('close', function (code) {
    t.equals(code, 0);
  });
});
