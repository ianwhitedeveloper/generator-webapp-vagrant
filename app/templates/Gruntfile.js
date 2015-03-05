'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configure grunt packages
  grunt.initConfig({

    // Automatically inject Bower JS and CSS components into the HTML blocks
    bowerInstall: {
      app: {
        src: ['app/index.html'],
        exclude: [
          <% if (includeModernizr) { %>'bower_components/modernizr/*'<% } if (includeModernizr && includeRespond) { %>,<% } %>
          <% if (includeRespond) { %>'bower_components/respond/*'<% } if (includeBootstrap || includeAngular) { %>,<% } %>
          <% if (includeBootstrap || includeAngular) { %>'bower_components/bootstrap/dist/*'<% } %>
        ]
      }
    },

    // Replace relative URLs with CDN path
    // Runs with grunt build. When blank, nothing will happen.
    cdn: {
      options: {
        cdn: '',
        flatten: false
      },
      dist: {
        src: ['./dist/{,*/}*.html', './dist/css/{,*/}*.css']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      }
    },

    // Connect to a local server
    connect: {
      options: {
        port: 8080,
        hostname: '0.0.0.0',
        base: 'app',
        open: true
      },

      // Inject livereload.js in dev environment for live reloading
      dev: {
        options: {
          middleware: function (connect) {
            return [
              require('connect-livereload')(),
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static('app')
            ];
          }
        }
      },

      //
      dist: {
        options: {
          base: 'dist',
          livereload: false
        }
      }
    },

    // Copy files to another location
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'img/*',
            '{,*/}*.html',
            'fonts/*',
            'json/*'
          ]
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '{,*/}*.html',
          dest: 'dist'
        }]
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'app/js/{,*/}*.js'
      ]
    },

    // Compile LESS files
    less: {
      dist: {
        files: {
          'app/css/main.css': ['app/less/main.less']
        }
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            'dist/js/{,*/}*.js',
            'dist/css/{,*/}*.css'
          ]
        }
      }
    },
<% if (includeAngular) { %>
    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/js',
          src: 'main.min.js',
          dest: '.tmp/concat/js'
        }]
      }
    },
<% } %>
    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: 'dist',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      },
      html: 'app/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['dist', 'dist/img']
      },
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css']
    },

    // Watch specific file types for changes and reload them
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: ['app/js/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['app/css/*.css']
      },
      less: {
        files: ['app/less/*.less'],
        tasks: ['less']
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['bowerInstall']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: ['*', 'app/*', 'app/js/*.js', 'app/css/*.css', 'app/{,*/}*.html', 'app/{,*/}*.php']
      }
    }

  });

  // Default grunt tasks. Runs with "grunt" or "grunt default"
  grunt.registerTask('default', [
    'bowerInstall',
    'jshint',
    'connect:dev',
    'less',
    'watch'
  ]);

  // Build task to generate files for deployment. Runs with "grunt build"
  grunt.registerTask('build', [
    'bowerInstall',
    'jshint',
    'clean:dist',
    'useminPrepare',
    'concat',
    <% if (includeAngular) { %>'ngmin',<% } %>
    'cssmin',
    'uglify',
    'copy:dist',
    'rev',
    'usemin',
    'htmlmin'
    // 'cdn'
  ]);

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run(['default']);
  });

};