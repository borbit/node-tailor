module.exports = function(imgs, cb) {
  var map = {};
  var size = [
    calcWidth(imgs),
    calcHeight(imgs)
  ];

  var x = 0;
  var y = 0;

  for (var i in imgs) {
    var img = imgs[i];
    map[img.osrc] = [x, y];
    x += img.width;
  }

  return {
    size: size
  , map: map
  };
};

function calcHeight(imgs) {
  var height = 0;
  for (var src in imgs) {
    var img = imgs[src];
    if (height < img.height) {
      height = img.height;
    }
  }
  return height;
}

function calcWidth(imgs) {
  var width = 0;
  for (var src in imgs) {
    width += imgs[src].width;
  }
  return width;
}