// source: http://andy-carter.com/blog/a-beginners-guide-to-package-manager-bower-and-using-gulp-to-manage-components
// http://www.mikestreety.co.uk/blog/an-advanced-gulpjs-file

var vendorFiles = {
    styles: '',
    scripts: ''
};

// Include gulp
var gulp = require('gulp');

var es = require('event-stream');
var gutil = require('gulp-util');

// Include plugins
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});

// configure main bower files
plugins.mainBowerFiles({
	paths: {
		bowerrrc: './'
	}
});

// Define config file
var config = require('./gulpconfig.json');

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';
var sourceMap = false;

if (gutil.env.dev === true) {
    sassStyle = 'expanded';
    sourceMap = true;
    isProduction = false;
}

gulp.task('css', loadStyles());
gulp.task('js', loadScripts());

function loadStyles() {
	var theme = gutil.env.type;

	if (theme && config.styles[theme]) {
		// requested theme
		config.styles[theme].forEach(function(data) {
			watchStyles(data);
		});
	} else {
		// all
		for (var theme in config.styles) {
			config.styles[theme].forEach(function(data) {
				watchStyles(data);
			});
		}
	}
}

function buildStyles(data) {
	var sassFiles = gulp.src(plugins.mainBowerFiles().concat(data.src))
						.pipe(plugins.filter(['*.css', '*.scss']))
    					.pipe(plugins.plumber())
    					.pipe(plugins.sass({
        					outputStyle: sassStyle,
        					sourceMap: sourceMap,
        					precision: 8,
        					includePaths: [
        						'./src/vendor/bootstrap-sass/assets/stylesheets',
        						'./src/vendor/components-font-awesome/scss'
        					]
    					}));

    es.concat(sassFiles)
    	.pipe(plugins.concat(data.dest.filename))
    	.pipe(isProduction ? plugins.minifyCss({advanced: false}) : gutil.noop())
    	.pipe(plugins.size({showFiles:true}))
    	.pipe(gulp.dest(data.dest.path));
    return;
}

function watchStyles(data) {
	gulp.watch(data.watch, ['css']).on('change', function(evt) {
        buildStyles(data);
        changeEvent(evt, data.src);
    });
    return;
}

function loadScripts() {
	var theme = gutil.env.type;

	if (theme && config.scripts[theme]) {
		// requested theme
		config.scripts[theme].forEach(function(data) {
			watchScripts(data);
		});
	} else {
		// all
		for (var theme in config.scripts) {
			config.scripts[theme].forEach(function(data) {
				watchScripts(data);
			});
		}
	}
	return;
}

function watchScripts(data) {
	gulp.watch(data.watch, ['js']).on('change', function(evt) {
        buildScripts(data);
        changeEvent(evt, data.src);
    });
    return;
}

function buildScripts(data) {
    gulp.src(plugins.mainBowerFiles().concat(data.src))
	        .pipe(plugins.filter('*.js'))
	        .pipe(plugins.concat(data.dest.filename))
	        .pipe(isProduction ? plugins.uglify() : gutil.noop())
	        .pipe(plugins.size({title:data.dest.path + data.dest.filename}))
	        .pipe(gulp.dest(data.dest.path));
	return;
}

var changeEvent = function(evt, src) {
    gutil.log('File', gutil.colors.cyan(evt.path), 'was', gutil.colors.magenta(evt.type));
    return;
};

gulp.task('default', ['css', 'js']);
