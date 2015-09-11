# gulp-bower-setup
Basic site starting point containing Gulp and Bower, pulling in jQuery, Twitter Bootstrap and Font Awesome

## Getting Started

To install the required Gulp plugins already defined in gulpfile.js saveDependencies run

    npm install

To install the required Bower components run

	bower install

When pulling the repository also double-check that the *.bowerrc* file is available. This will instruct Bower to install components into *./src/vendor* rather than the default *./bower_components* directory.