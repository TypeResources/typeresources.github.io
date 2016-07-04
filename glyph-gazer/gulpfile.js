var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var uglify = require('gulp-uglify');

// Static Server + watching scss/html files
gulp.task('serve', ['sass', 'js', 'svg-sprite'], function() {

  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch('src/icons/*.svg', ['svg-sprite']);
  gulp.watch('src/styles/*.scss', ['sass']);
  gulp.watch('src/*.js', ['js']);
  gulp.watch('*.html').on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

// Compress JS
gulp.task('js', function (cb) {
  return gulp.src('src/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

// Create SVG sprite
gulp.task('svg-sprite', function() {
  return gulp.src('src/icons/*.svg')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(svgmin())
    .pipe(rename({prefix: 'sprite_'}))
    .pipe(svgstore())
    .pipe(gulp.dest('dist/'));
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
