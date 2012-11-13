module.exports = function(imgs, cb) {
  var rects = []; 

  for (var src in imgs) {
    rects.push({
      w: imgs[src].width
    , h: imgs[src].height
    , s: src
    });
  }

  rects.sort(function(b1, b2) {
    if (b1.w > b2.w) { return -1; }
    if (b1.w < b2.w) { return 1; }
    return 0;
  });

  return arrange(rects);
};

function arrange(rects) {
  var map = {};
  var root = {
    x: 0, y: 0
  , w: rects[0].w
  , h: rects[0].h
  };

  rects.forEach(function fit(rect) {
    var w = rect.w;
    var h = rect.h;
    var s = rect.s;

    var node = findNode(root, w, h);

    if (!node) {
      root = growNode(root, w, h);
      return fit(rect);
    }

    splitNode(node, w, h);
    map[s] = [node.x, node.y];
  });

  return {
    size: [root.w, root.h]
  , map: map
  };
}

function findNode(node, w, h) {
  if (node.r || node.d) {
    return findNode(node.r, w, h) || findNode(node.d, w, h);
  }
  if (w <= node.w && h <= node.h) {
    return node;
  }
  return false;
}

function splitNode(node, w, h) {
  node.d = {
    x: node.x
  , y: node.y + h
  , w: node.w
  , h: node.h - h
  };
  node.r = {
    x: node.x + w
  , y: node.y
  , w: node.w - w
  , h: h
  };
  return node;
}

function growNode(node, w, h) {
  var canGrowDown  = w <= node.w;
  var canGrowRight = h <= node.h;

  var shdGrowDown  = canGrowDown && node.w >= (node.h + h);
  var shdGrowRight = canGrowRight && node.h >= (node.w + w);

  if (shdGrowRight) return growRight(node, w, h);
  if (shdGrowDown)  return growDown(node, w, h);
  if (canGrowRight) return growRight(node, w, h);
  if (canGrowDown)  return growDown(node, w, h);
}

function growRight(node, w, h) {
  var right = {
    x: node.w
  , y: 0
  , w: w
  , h: node.h
  };

  return {
    x: 0
  , y: 0
  , w: node.w + w
  , h: node.h
  , d: node
  , r: right
  };
}

function growDown(node, w, h) {
  var down = {
    x: 0
  , y: node.h
  , w: node.w
  , h: h
  };

  return {
    x: 0
  , y: 0
  , w: node.w
  , h: node.h + h
  , r: node
  , d: down
  };
}