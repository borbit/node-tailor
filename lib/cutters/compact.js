module.exports = function(imgs, cb) {
  var map = {};

  var x = 0;
  var y = 0;

  var blocks = []; 

  for (var src in imgs) {
    blocks.push({
      w: imgs[src].width
    , h: imgs[src].height
    , s: src
    });
  }

  blocks.sort(function(b1, b2) {
    if (b1.w > b2.w) {
      return -1;
    }
    if (b1.w < b2.w) {
      return 1;
    }
    return 0;
  });

  var map = fit(blocks);

  console.log(map);

  process.exit();

  return {
    size: size
  , map: map
  };
};

function fit(blocks) {
  var node, block, len = blocks.length;
  var w = len > 0 ? blocks[0].w : 0;
  var h = len > 0 ? blocks[0].h : 0;
  var root = {x: 0, y: 0, w: w, h: h};

  var map = {};
  var pos;

  for (var n = 0; n < len; n++) {
    block = blocks[n];

    if (node = findNode(root, block.w, block.h)) {
      pos = splitNode(node, block.w, block.h);
    } else {
      pos = growNode(root, block.w, block.h);
    }

    map[block.s] = [pos.x, pos.y];
  }

  return map;

  function findNode(node, w, h) {
    if (node.used) {
      return findNode(node.right, w, h) || findNode(node.down, w, h);
    } else if (w <= node.w && h <= node.h) {
      return node;
    }

    return null;
  }

  function splitNode(node, w, h) {
    var x = node.x;
    var y = node.y;
    var w = node.w;
    var h = node.h;

    node.used = true;
    node.down  = {x: x, y: y + h, w: w, h: node.h - h};
    node.right = {x: x + w, y: y, w: node.w - w, h: h};

    return node;
  }

  function growNode(root, w, h) {
    var canGrowDown  = w <= root.w;
    var canGrowRight = h <= root.h;

    var shouldGrowRight = canGrowRight && (root.h >= (root.w + w));
    var shouldGrowDown = canGrowDown && (root.w >= (root.h + h));

    if (shouldGrowRight) {
      return growRight(root, w, h);
    }
    else if (shouldGrowDown) {
      return growDown(root, w, h);
    }
    else if (canGrowRight) {
      return growRight(root, w, h);
    }
    else if (canGrowDown) {
      return growDown(root, w, h);
    }
    
    return null;
  }

  function growRight(root, w, h) {
    root = {
      used: true
    , x: 0
    , y: 0
    , w: root.w + w
    , h: root.h
    , down: root
    , right: { x: root.w, y: 0, w: w, h: root.h }
    };

    var node = findNode(root, w, h);

    if (node) {
      return splitNode(node, w, h);
    }
    return null;
  }

  function growDown(root, w, h) {
    root = {
      used: true
    , x: 0
    , y: 0
    , w: root.w
    , h: root.h + h
    , down: {x: 0, y: root.h, w: root.w, h: h}
    , right: root
    };

    var node = findNode(root, w, h);

    if (node) {
      return splitNode(node, w, h);
    }
    return null;
  }
}