Tailor
------

CSS Sprites Generator.

Installation
------------

  Sprites generation is built on top of the [node-canvas](https://github.com/LearnBoost/node-canvas)
  which requires the __Cairo__. For system-specific installation view the
  [Wiki](https://github.com/LearnBoost/node-canvas/wiki/_pages).

    $ npm install -g tailor

Usage
-----

  I have a `styles.css` and I want all background images to be automaticaly sewed into a css sprite.

    .link {
      display: block;
      height: 28px;
      width: 28px;
    }

    .link-facebook {
      background-image: url("icon-facebook.png");
    }

    .link-google {
      background-image: url("icon-google.png");
    }

    .link-twitter {
      background-image: url("icon-twitter.png");
    }

    .link-vk {
      background-image: url("icon-vk.png");
    }

  First I have to do is to add additional, vendor-prefixed properties to tell Tailor how the sprite should be sewed:

  - `-tailor-type`

    Sprite type. Can be `horizontal`, `vertical` or `compact`.

  - `-tailor-group`

    To group images into the separate sprite (optional). Default: `all`.


    ...

    .link-facebook {
      background-image: url("icon-facebook.png");
      -tailor-type: compact;
    }

    .link-google {
      background-image: url("icon-google.png");
      -tailor-type: compact;
    }

    .link-twitter {
      background-image: url("icon-twitter.png");
      -tailor-type: compact;
    }

    .link-vk {
      background-image: url("icon-vk.png");
      -tailor-type: compact;
    }

  All my images are in the `./images` directory and I want to put sprites and processed css file to the `./result` directory.

  With command line:

    $ tailor -r images -o result styles.css

  Programmatically:

    var tailor = require('tailor');

    var files = ['styles.css'];
    var options = {
      rootDirPath: 'images'
    , outDirPath: 'result'
    };

    tailor(files, options, function(err) {
      console.log('Sewed!');
    });

  As a result there will be a sprite file and processed `styles.css` file in the `./result` directory.
	
    ...
    
    .link-facebook {
      background-image: url("1a29b94c7137b58.png");
      background-position: 0px 0px
    }

    .link-google {
      display: none;
      background-image: url("1a29b94c7137b58.png");
      background-position: -28px 0px
    }

    .link-twitter {
      background-image: url("1a29b94c7137b58.png");
      background-position: 0px -28px
    }

    .link-vk {
      background-image: url("1a29b94c7137b58.png");
      background-position: -28px -28px
    }

License
-------

[MIT](http://en.wikipedia.org/wiki/MIT_License#License_terms). Copyright (c) 2012 Serge Borbit &lt;serge.borbit@gmail.com&gt;