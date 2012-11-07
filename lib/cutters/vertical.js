module.exports = function(imgs, cb) {
  var map = {};
  var size = [
    calcWidth(imgs),
    calcHeight(imgs)
  ];

  var x = 0;
  var y = 0;

  for (var src in imgs) {
    var img = imgs[src];
    map[src] = [x, y];
    y += img.height;
  }

  return {
    size: size
  , map: map
  };
};

function calcHeight(imgs) {
  var height = 0;
  for (var src in imgs) {
    height += imgs[src].height;
  }
  return height;
}

function calcWidth(imgs) {
  var width = 0;
  for (var src in imgs) {
    var img = imgs[src];
    if (width < img.width) {
      width = img.width;
    }
  }
  return width;
}