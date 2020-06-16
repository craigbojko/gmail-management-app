/**
 * Project: g-mail-management-app
 * FilePath: /client/app/index.js
 * File: index.js
 * Created Date: Tuesday, June 16th 2020, 12:28:39 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2020 Pixel Ventures Ltd.
 * ------------------------------------
 */

angular
  .module('app', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/templates/test.template.html',
        controller: 'Controller1'
      })
      .otherwise({
        redirectTo: '/'
      })
  })
