'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-release');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true,
                ignores: ['node_modules/**/*']
            },
            all: ['./**/*.js']
        },

        jscs: {
            src: './**/*.js',
            options: {
                config: '.jscsrc',
                excludeFiles: ['node_modules/**/*']
            }
        },

        release: {
            options: {
                npm: true,
                indentation: '    ',
                github: {
                    repo: 'fiddus/datatablesQuery',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_ACCESS_TOKEN'
                }
            }
        }
    });

    grunt.registerTask('lint', ['jshint', 'jscs']);
};
