'use strict';

SystemJS.config({
  'transpiler': 'plugin-babel',
    'map': {
        'plugin-babel': './node_modules/systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build': './node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',

        //Libraries:
        'jquery': './node_modules/jquery/dist/jquery.js',
        'handlebars': './bower_components/handlebars/handlebars.min.js',
        'toastr': './bower_components/toastr/toastr.min.js',
        'sammy': './bower_components/sammy/lib/min/sammy-latest.min.js',

        //Utils
        'requester': './js/utils/requester.js',
        'header-generator': './js/utils/header-generator.js',
        'template-generator': './js/utils/template-generator.js',

        //Constants
        'application-urls': './js/utils/constants/application-urls.js',
        'kinvey-urls': './js/utils/constants/kinvey-urls.js',


        //Main script
        'app': './js/app.js'
      }
});

System.import('app');
