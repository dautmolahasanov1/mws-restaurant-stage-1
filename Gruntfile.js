/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function(grunt) {
    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    //engine: 'im',
                    sizes: [{
                        name: 'small',
                        width: '480',
                        quality: 25
                    }, {
                        name: 'medium',
                        width: '640',
                        quality: 35
                    }, {
                        name: 'large',
                        width: '1200',
                        quality: 35
                    }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg}'],
                    cwd: 'img/',
                    dest: 'dest/img/'
                }]
            }
        },


        /* Clear out the images directory if it exists */
        clean: {
            dev: {
                src: ['dest/img/', 'dest/css/'],
            },
        },

        /* Generate the images directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: ['dest/img/', 'dest/css/']

                },
            },
        },

        /* Copy the "fixed" images that don't go through processing into the images/directory */

        concat_css: {
            options: {
                // Task-specific options go here.
            },
            all: {
                src: ['css/*.css'],
                dest: 'dest/css/styles.css'
            },
        },

        // "babel": {
        //     options: {
        //         sourceMap: true
        //     },
        //     dist: {
        //         files: {
        //             "dest/sw.js": "./sw.js"
        //         }
        //     }
        // },

        browserify: {
            dev: {
                // options: {
                //     plugin: [
                //         'idb', // register plugin by name
                //         ['idb', { noServe: true }] // register plugin with name and options
                //     ]
                // },
                files: {
                    './dest/sw.js': './sw.js'
                },

            }
        },

        copy: {
            dev: {
                files: [{
                    expand: true,
                    src: 'data/*',
                    dest: 'dest/'
                }, {
                    expand: true,
                    src: 'js/*.js',
                    dest: 'dest/'
                }, {
                    //     expand: true,
                    //     src: 'sw.js',
                    //     dest: 'dest/'
                    // }, {
                    expand: true,
                    src: '*.html',
                    dest: 'dest/'
                }, {
                    expand: true,
                    src: 'sw.js',
                    dest: 'dest/'
                }, {
                    expand: true,
                    src: 'manifest.json',
                    dest: 'dest/'
                }, {
                    expand: true,
                    src: 'img/*',
                    dest: 'dest/'
                }]
            },
        },

        serve: {
            'path': 'Users/dautm/Desktop/Udacity/Restaurant%20app/mws-restaurant-stage-1/dest/index.html',
            options: {
                port: 8888
            }

        }
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['clean', 'mkdir', 'copy', 'browserify', 'responsive_images', 'concat_css']);

};