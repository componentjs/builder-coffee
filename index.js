var cs = require('coffee-script');
var calculate = require('sse4_crc32').calculate;

var cache = Object.create(null);

exports = module.exports = function (options) {
  options = options || {};
  options.bare = true;
  options.sourceMap = true;

  return function coffeescript(file, done) {
    if (!~exports.extensions.indexOf(file.extension)) return done();
    file.read(function (err, string) {
      if (err) return done(err);

      var hash = file.filename + '#' + calculate(string);
      var res;
      try {
        res = cache[hash] = cache[hash] || cs.compile(string, options);
      } catch (err) {
        done(err);
        return;
      }

      // have any future plugin treat this string as JS
      file.extension = 'js';

      // rewrite source map
      var map = JSON.parse(res.v3SourceMap);
      map.sources[0] = file.filename;
      map.sourcesContent = [string];

      file.string = res.js;
      file.sourceMap = JSON.stringify(map);
      file.originalString = string; // why not

      done();
    })
  }
}

// extensions to support
exports.extensions = [
  'coffee',
  'litcoffee'
];