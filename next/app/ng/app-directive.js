"use strict";
define([
    'require/text!./app.tpl'
    ], function(
    template
) {
    function appDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'AppController'
          , replace: true
          , transclude: true
          , template: template
        };
    }
    appDirective.$inject = [];
    
    return appDirective;
})
