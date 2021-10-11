module.exports = function(grunt) {
    grunt.initConfig({
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                mangle: false,
                sourceMapIn: (file) => file+".map",
                sourceMap: {
                    includeSources: true
                }
            },
            dist: {
                files: {
                    "docs/index.js": 'build/compiled/index.js'
                }
            }
        },
        babel: {
            options: {
                presets: ['@babel/preset-react'],
                sourceMap: true
            },
            dist: {
                files: {
                    'build/compiled/index.js': 'src/js/index.js'
                }
            }
        },
        cssmin: {
            options: {
                
            },
            dist: {
                files: {
                    "docs/index.css": "src/css/index.css"
                }
            }
        },
        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            dist: {
                files: {
                    "docs/index.html": "build/processed/index.html"
                }
            }
        },
        preprocess: {
            dist: {
                options: {
                    context: {
                        PROD: true
                    },
                },
                files: {
                    "build/processed/index.html": "src/html/index.html"
                }
            },
            dev: {
                options: {
                    context: {},
                },
                files: {
                    "develop/index.html": "src/html/index.html"
                }
            }
        },
        copy: {
            dev: {
                files: {
                    "build/processed/index.html": "develop/index.html"
                }
            }
        },
        watch: {
            dist: {
                
            },
            dev: {
                files: ['src/html/index.html'],
                tasks: ['preprocess:dev','copy:dev']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    
    grunt.registerTask('default', ['watch:dev'])
    grunt.registerTask('dist', ['preprocess:dist', 'htmlmin:dist', 'cssmin:dist', 'babel:dist', 'uglify:dist'])
    
    /*
    grunt.event.on('watch', function(action, filepath) {
        for (const plugin of ["preprocess", "copy"]) {
            let found = false
            for (const [key, value] of Object.entries(grunt.config(plugin+".dev.files"))) {
                if (value === filepath) {
                    found = key
                    break
                }
            }
            if (found) {
                grunt.config(plugin+".dev.files", {found: filepath})
            }
        }
    });*/
};
