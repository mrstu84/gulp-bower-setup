//
// Define Gulp plugin config options
// --------------------------------------------

// Configure Auto Prefixer (https://github.com/sindresorhus/gulp-autoprefixer / https://github.com/ai/browserslist)
var autoprefixerOptions = {
	browsers: ['IE 8', 'IE 9', 'last 2 versions']
};

// Configure Main Bower Files (https://github.com/ck86/main-bower-files)
var mainBowerFilesOptions = {
	paths: {
		bowerrrc: './'
	}
};

// Sass Include Paths
// For example: When using Bootstrap, assign here to enable your libsass to easily include complex Bower component file paths
// '@import "bootstrap/variables";' rather than '@import "./bootstrap-sass/assets/stylesheets/bootstrap/variables";' without
var sassIncludePaths = [
	'./src/vendor/bootstrap-sass/assets/stylesheets',
	'./src/vendor/components-font-awesome/scss'
];

//
// Beginning of Gulp processes
// --------------------------------------------

// Include gulp
var gulp = require('gulp');

var es = require('event-stream');
var gutil = require('gulp-util');

// Include plugins
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});

// Define config file
var config = require('./gulpconfig.json');

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';

if (gutil.env.dev === true) {
	isProduction = false;
	sassStyle = 'expanded';
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
	var sassFiles = gulp.src(plugins.mainBowerFiles(mainBowerFilesOptions).concat(data.src))
		.pipe(plugins.filter(['*.css', '*.scss']))
		.pipe(plugins.plumber())
		.pipe(isProduction ? gutil.noop() : plugins.sourcemaps.init()) // Init sourcemaps for debugging
		.pipe(plugins.sass({
			outputStyle: sassStyle,
			precision: 8,
			includePaths: sassIncludePaths
		}));

	var css = es.concat(sassFiles)
		.pipe(plugins.concat(data.dest.filename))
		.pipe(plugins.autoprefixer(autoprefixerOptions))
		.pipe(isProduction ? plugins.minifyCss({advanced: false}) : gutil.noop())
		.pipe(isProduction ? gutil.noop() : plugins.sourcemaps.write()) // Inline sourcemaps if not production
		.pipe(plugins.size({showFiles:true,title:'Output'}));

	// Output file to each destination in paths
	if (typeof data.dest.paths === 'string') {
		css.pipe(gulp.dest(data.dest.paths));
	} else {
		for (var i=0; i<data.dest.paths.length; i++) {
			css.pipe(gulp.dest(data.dest.paths[i]));
		}
	}

	// add blank line to aid output readability
	gutil.log('');

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
	var js = gulp.src(plugins.mainBowerFiles(mainBowerFilesOptions).concat(data.src))
			.pipe(plugins.filter('*.js'))
			.pipe(plugins.concat(data.dest.filename))
			.pipe(isProduction ? plugins.uglify() : gutil.noop())
			.pipe(plugins.size({showFiles:true,title:'Output'}));

	// Output file to each destination in paths
	if (typeof data.dest.paths === 'string') {
		js.pipe(gulp.dest(data.dest.paths));
	} else {
		for (var i=0; i<data.dest.paths.length; i++) {
			js.pipe(gulp.dest(data.dest.paths[i]));
		}
	}

	// add blank line to aid output readability
	gutil.log('');

	return;
}

var changeEvent = function(evt, src) {
	gutil.log('File', gutil.colors.cyan(evt.path), 'was', gutil.colors.magenta(evt.type));
	return;
};

gulp.task('default', ['css', 'js']);
