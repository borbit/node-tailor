/**
 * Module dependencies.
 */
var crypto = require('crypto');
var Canvas = require('canvas');
var async = require('async');
var path = require('path');
var css = require('css');
var fs = require('fs');

/**
 * Constants
 */
var VENDOR_PREF = '-tailor-';
var PROP_GROUP = VENDOR_PREF + 'group';
var PROP_TYPE = VENDOR_PREF + 'type';
var PROP_IMG = 'background-image';

var cutters = {
  horizontal: require('./cutters/horizontal')
, vertical: require('./cutters/vertical')
, compact: require('./cutters/compact')
};

var Image = Canvas.Image;

module.exports = function(files, o, cb) {
  o || (o = {});
  o.rootDirPath || (o.rootDirPath = '');
  o.outDirPath || (o.outDirPath = '');

  async.forEach(files, function(srcFilePath, cb) {
    async.waterfall([
      function(cb) {
        readFile(srcFilePath, cb);
      },
      function(content, cb) {
        sew(content, o, cb);
      },
      function(content, cb) {
        var srcFileName = path.basename(srcFilePath);
        var resFilePath = path.join(o.outDirPath, srcFileName);

        writeFile(resFilePath, content, cb);
      }
    ], cb);
  }, cb);
};

function sew(content, o, cb) {
  var ast = css.parse(content);
  var billets = collectBillets(ast);
  var sources = collectSources(billets);
  
  loadImages(sources, o.rootDirPath, function(err, images) {
    if (err) return cb(err);

    var patterns = cutoutSprites(billets, images);
    var sprites = sewSprites(patterns, images);
    var saved = saveSprites(sprites, o.outDirPath);
    
    applySprites(ast, patterns, saved);

    cb(null, css.stringify(ast));
  });
}

function loadImages(sources, rootPath, cb) {
  var imgs = {};

  async.forEach(sources, function(src, cb) {
    var filePath = path.join(rootPath, src);

    imgs[src] = new Image();
    imgs[src].onload = cb;
    imgs[src].onerror = function() {
      cb(new Error('cannot load image ' + filePath));
    };

    imgs[src].src = filePath;
  }, function(err) {
    if (err) return cb(err);
    cb(null, imgs);
  });
}

function cutoutSprites(billets, images) {
  var patterns = {};
  
  for(var type in billets) {
    var cutter = cutters[type];
    patterns[type] = {};

    for(var group in billets[type]) {
      var sources = billets[type][group]; 
      var groupped = {};

      sources.forEach(function(src) {
        groupped[src] = images[src];
      });

      patterns[type][group] = cutter(groupped);
    }
  }

  return patterns;
}

function sewSprites(patterns, images) {
  var sewed = {};
  
  for(var type in patterns) {
    sewed[type] = {}

    for(var group in patterns[type]) {
      var pattern = patterns[type][group];
      var sprite = sewSprite(images, pattern);

      sewed[type][group] = sprite;
    }
  }

  return sewed;
}

function sewSprite(images, pattern) {
  var w = pattern.size[0];
  var h = pattern.size[1];

  var canvas = new Canvas(w, h);
  var ctx = canvas.getContext('2d')
  var map = pattern.map;
  
  for (var src in map) {
    var x = map[src][0];
    var y = map[src][1];

    ctx.drawImage(images[src], x, y);
  }

  return canvas;
}

function collectBillets(ast) {
  var rules = ast.stylesheet.rules;
  var billets = {};

  rules.forEach(function(rule) {
    var props;

    if (!(props = findProps(rule)))
      return;

    var g = props.group;
    var t = props.type;
    var s = props.src;

    var list = (
      billets[t]    || (billets[t] = {}),
      billets[t][g] || (billets[t][g] = [])
    );

    !~list.indexOf(s) && list.push(s);
  });

  return billets;
}

function collectSources(billets) {
  var sources = [];

  for (var type in billets) {
    for (var group in billets[type]) {
      billets[type][group].forEach(function(src) {
        !~sources.indexOf(src) && sources.push(src);
      });
    }
  }

  return sources;
}

function findProps(rule) {
  var res = {};

  rule.declarations.forEach(function(decl) {
    if (decl.property === PROP_IMG)   res.src = decl.value;
    if (decl.property === PROP_TYPE)  res.type = decl.value;
    if (decl.property === PROP_GROUP) res.group = decl.value;
  });

  if (!res.src || !res.type)
    return false;

  if (typeof(res.group) === 'undefined')
    res.group = 'all';

  res.src = res.src.replace(/^url\(["']?/, '')
                   .replace(/["']?\)$/, '');

  return res;
}

function readFile(filePath, cb) {
  fs.readFile(filePath, 'utf8', cb);
}

function writeFile(filePath, content, cb) {
  fs.writeFile(filePath, content, cb);
}

function saveSprites(sprites, outPath) {
  var saved = {};

  for (var type in sprites) {
    saved[type] = {}

    for (var group in sprites[type]) {
      var sprite = sprites[type][group];
      var md5hash = crypto.createHash('md5');
      md5hash.update(sprite.toDataURL());
      md5hash = md5hash.digest('hex');

      var fileName = md5hash.substr(0, 15) + '.png';
      var filePath = path.join(outPath, fileName);

      saved[type][group] = fileName;
      saveSprite(sprite, filePath);
    }
  }

  return saved;
}

function saveSprite(sprite, filePath) {
  var out = fs.createWriteStream(filePath);
  var stream = sprite.createPNGStream();
  stream.pipe(out);
}

function applySprites(ast, patterns, saved) {
  var rules = ast.stylesheet.rules;

  rules.forEach(function(rule) {
    var props = findProps(rule);

    if (!props) return;

    var s = props.src;
    var t = props.type;
    var g = props.group;

    var pattern = patterns[t][g];
    var filePath = saved[t][g];
    var pos = pattern.map[s];

    var clear = rule.declarations.filter(function(decl) {
      return decl.property !== PROP_IMG &&
             decl.property !== PROP_TYPE &&
             decl.property !== PROP_GROUP;
    });

    clear.push({
      property: 'background-image'
    , value: stringifyUrl(filePath)
    });

    clear.push({
      property: 'background-position'
    , value: stringifyPosition(pos)
    });

    rule.declarations = clear;
  });
}

function stringifyUrl(filePath) {
  return 'url("' + filePath + '")';
}

function stringifyPosition(position) {
  return -position[0] + 'px '
       + -position[1] + 'px';
}