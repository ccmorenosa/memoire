import {rollup} from 'rollup';
import {default as terser} from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import {default as commonjs} from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';

import gulp from "gulp";
import clean from "gulp-clean";
import nested from 'postcss-nested';
import minify from 'gulp-clean-css';
import header from 'gulp-header-comment';
import postcss from 'gulp-postcss';
import autoprefixer from 'gulp-autoprefixer';
import includePartials from 'gulp-file-include';

import * as sass from 'sass';

import tailwindcss from "@tailwindcss/postcss";

import through from 'through2';

const cssLicense = `
reveal.js 5.1.0
https://revealjs.com
MIT licensed

Copyright (C) 2011-2024 Hakim El Hattab, https://hakim.se
`;

const babelConfig = {
    babelHelpers: 'bundled',
    ignore: ['node_modules'],
    compact: false,
    extensions: ['.js'],
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: 3,
                useBuiltIns: 'usage',
                modules: false,
                targets: {
                    browsers: [
                        'last 2 Chrome versions',
                        'last 2 Safari versions',
                        'last 2 iOS versions',
                        'last 2 Firefox versions',
                        'last 2 Edge versions',
                    ]
                }
            }
        ]
    ]
};

// a custom pipeable step to transform Sass to CSS
function compileSass() {
    return through.obj( ( vinylFile, encoding, callback ) => {
        const transformedFile = vinylFile.clone();

        sass.render({
            silenceDeprecations: ['legacy-js-api'],
            data: transformedFile.contents.toString(),
            file: transformedFile.path,
        }, ( err, result ) => {
            if( err ) {

                console.error("Sass Compile Error:", err.message);
                callback(err);
            }
            else {
                transformedFile.extname = '.css';
                transformedFile.contents = result.css;

                callback( null, transformedFile );
            }
        });
    });
}

var dist_dir = './dist'
var slides_dir = `${dist_dir}/presentations`
var static_dir = `${dist_dir}/static`
var public_dir = `${slides_dir}/public`
var style_dir = `${slides_dir}/style`

// Theme task

function buildThemes() {
    return gulp.src(['./style/theme/source/*.{sass,scss}'])
    .pipe(compileSass())
    .pipe(gulp.dest(`${style_dir}/theme/`));
}

function buildCssCore() {
    return gulp.src(['style/theme/reveal.scss'])
    .pipe(compileSass())
    .pipe(autoprefixer())
    .pipe(minify({compatibility: 'ie9'}))
    .pipe(header(cssLicense))
    .pipe(gulp.dest(`${style_dir}`));
}

// Development Tasks
function devHTML() {
    return gulp.src("./presentations/**/*.html")
    .pipe(includePartials())
    .pipe(gulp.dest(`${slides_dir}/`));
}

import autoprefixer2 from 'autoprefixer';
function devStyles() {
    return gulp.src([
        "./style/*.css"
    ])
    .pipe(postcss([tailwindcss({
        tailwindjs: "./tailwind.config.js",
    }), autoprefixer2(), nested()]))
    .pipe(gulp.dest(`${style_dir}`));
    // .pipe(concat({ path: "style.css" }))
}

function devScripts() {
    return gulp.src([
        "./scripts/**/*.js",
        "./reveal.js/dist/*.js"
    ])
    .pipe(gulp.dest(`${slides_dir}`));
    // .pipe(concat({ path: "scripts.js" }))
}

function devPublic() {
    return gulp.src("./public/**/*", { encoding: false }).pipe(
        gulp.dest(`${public_dir}`)
    );
}

function devClean() {
    return gulp.src(
        "${slides_dir}",
        { read: false, allowEmpty: true }
    )
    .pipe(clean());
}

gulp.task('plugins', () =>
    Promise.all([
            {name: 'Markdown', file: 'markdown/markdown'},
            {name: 'KateX', file: 'math/math'},
            {name: 'RevealNotes', file: 'notes/notes'},
        ].flatMap(plugin =>
            rollup({
                input: `./plugin/${plugin.file}.js`,
                plugins: [
                    nodeResolve(),
                    commonjs(),
                    babel({
                        ...babelConfig,
                        ignore: [/node_modules\/.*/],
                    }),
                    terser()
                ],
                external: ['../../socket.io/socket.io.esm.min.js'],
            }).then(bundle => [
                bundle.write({
                    file: `./${static_dir}/plugin/${plugin.file}.esm.js`,
                    name: plugin.name,
                    format: 'es',
                }),

                bundle.write({
                    file: `./${static_dir}/plugin/${plugin.file}.js`,
                    name: plugin.name,
                    format: 'iife',
                    globals: (file) => {
                        if (file.endsWith("/socket.io/socket.io.esm.min.js"))
                            return "io"
                        else
                            return file
                    }
                })]
            )
        )
    )
);

gulp.task('plugins-remote', () =>
    Promise.all([
            {name: 'RevealRemote', file: 'remote'},
            {name: 'RevealRemoteZoom', file: 'remotezoom'},
            {name: 'Markdown', file: 'markdown/markdown'},
            {name: 'KateX', file: 'math/math'},
            {name: 'RevealNotes', file: 'notes/notes'},
        ].flatMap(plugin =>
            rollup({
                input: `./plugin/${plugin.file}.js`,
                plugins: [
                    nodeResolve(),
                    commonjs(),
                    babel({
                        ...babelConfig,
                        ignore: [/node_modules\/.*/],
                    }),
                    terser()
                ],
                external: ['../../socket.io/socket.io.esm.min.js'],
            }).then(bundle => [
                bundle.write({
                    file: `./${static_dir}/plugin/${plugin.file}.esm.js`,
                    name: plugin.name,
                    format: 'es',
                }),

                bundle.write({
                    file: `./${static_dir}/plugin/${plugin.file}.js`,
                    name: plugin.name,
                    format: 'iife',
                    globals: (file) => {
                        if (file.endsWith("/socket.io/socket.io.esm.min.js"))
                            return "io"
                        else
                            return file
                    }
                })]
            )
        )
    )
);

gulp.task('server', () =>
    gulp.src('server/**/*')
        .pipe(gulp.dest(dist_dir)));


gulp.task('server-ui', () =>
    gulp.src('server-ui/**/*')
        .pipe(gulp.dest(`${static_dir}/ui`)));

gulp.task('diapo', gulp.series(
    devClean, gulp.parallel(buildCssCore, buildThemes),
    gulp.parallel(buildCssCore, devStyles, devScripts, devPublic, devHTML)
));

gulp.task('app', gulp.parallel('plugins-remote', 'server', 'server-ui'));

gulp.task('remote', gulp.parallel('app', 'diapo'));

gulp.task('default', gulp.parallel('plugins', 'diapo'));
