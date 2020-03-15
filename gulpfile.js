// ------------------------------------------------------------
// gulp
const gulp = require('gulp');

// ------------------------------------------------------------
// TypeScript
const ts = require('gulp-typescript');
// TypeScript Project
const tsProject = ts.createProject('tsconfig.json');

// ------------------------------------------------------------
// Sass
const sass = require('gulp-sass');

// ------------------------------------------------------------
// EJS
const ejs = require('gulp-ejs');

// ------------------------------------------------------------
// JavaScript minify
const uglify = require('gulp-uglify');
// CSS minify
const cleanCSS = require('gulp-clean-css');
// ベンダープレフィックス
const autoprefixer = require('gulp-autoprefixer');
// Prettier
const prettier = require('gulp-prettier');
// リネーム
const rename = require('gulp-rename');
// ファイル結合
const concat = require('gulp-concat');

// ------------------------------------------------------------
// エラーキャッチ
const plumber = require('gulp-plumber');
// エラー通知
const notify = require('gulp-notify');

// ------------------------------------------------------------
// ブラウザー同期
const browserSync = require('browser-sync').create();


// ------------------------------------------------------------
/** パス */
const paths = {
  root: 'web',
  sass: {
    src: './src/sass/**/*.scss',
    dist: './dist/css',
  },
  ts: {
    src: [
      './src/ts/**/*.ts'
    ],
    dist: './dist/js',
  },
  ejs: {
    src: ['./src/ejs/**/*.ejs', '!./src/ejs/**/_*.ejs'],
    dist: './dist',
  },
  copy: {
    src: [
      './dist/**/*.html',
      './dist/**/*.js',
      './dist/**/*.css',
    ],
    dist: './web'
  },
}

// ローカルサーバーの立ち上げ
const browserSyncOption = {
  port: 8004,
  server: {
    baseDir: paths.root,
    index: 'index.html'
  },
  reloadOnRestart: true
};

/**
 * 初期化
 * @param {*} done 
 */
const browserInit = (done) => {
  browserSync.init(browserSyncOption);
  done();
}

/**
 * リロード
 * @param {*} done 
 */
const browserReload = (done) => {
  browserSync.reload();
  done();
}

/**
 * TypeScriptをコンパイル
 */
const compileTypeScript = () => {
  return gulp.src(paths.ts.src)
    .pipe(plumber({
      // errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(tsProject())
    .pipe(concat('app.js'))
    .pipe(prettier({
      printWidth: 200,
      tabWidth: 2,
      semi: true,
      singleQuote: true
    }))
    .pipe(gulp.dest(paths.ts.dist));
}

/**
 * Sassをコンパイル
 */
const compileSass = () => {
  return gulp.src(paths.sass.src)
    .pipe(plumber({
      // errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
      // browsers: ['last 2 version'],
      // cascade: true
    }))
    .pipe(prettier())
    .pipe(gulp.dest(paths.sass.dist));
}

/**
 * EJSをコンパイル
 */
const compileEjs = () => {
  return gulp.src(paths.ejs.src)
    .pipe(plumber({
      // errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(ejs())
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(prettier())
    .pipe(gulp.dest(paths.ejs.dist));
}

/**
 * コピー
 */
function copy() {
  return gulp.src(paths.copy.src)
    .pipe(plumber({
      // errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(gulp.dest(paths.copy.dist));
}

/**
 * 監視
 * @param cb 
 */
function watch(cb) {
  // TypeScript
  gulp.watch(paths.ts.src, gulp.series(compileTypeScript, copy, browserReload));

  // Sass
  gulp.watch(paths.sass.src, gulp.series(compileSass, copy, browserReload));

  // EJS
  // gulp.watch(paths.ejs.src, gulp.series(compileEjs, copy, browserReload));
};

exports.default = gulp.series(browserInit, watch);