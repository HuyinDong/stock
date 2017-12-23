/**
 * Created by dongyin on 5/22/16.
 */

var mainApplicationModule = angular.module('mainApplicationModule',
    [
      'home',
      'sidenav'
    ]);



angular.element(document).ready(function(){
   angular.bootstrap(document,['mainApplicationModule']);
});
