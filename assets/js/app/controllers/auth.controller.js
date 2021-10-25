/**
 * Project: g-mail-management-app
 * FilePath: /assets/js/app/controllers/auth.controller.js
 * File: auth.controller.js
 * Created Date: Monday, June 22nd 2020, 3:13:57 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2020 Pixel Ventures Ltd.
 * ------------------------------------
 */

angular
  .module('app')
  .controller('authenticationController', [
    '$scope',
    '$location',
    'gmailService',
    function ($scope, $location, gmailService) {
      $scope.init = () => {
        $location.path('/labels')
      }

      $scope.login = () => gmailService.authenticate()

      $scope.init()
    }
  ])
  .service('authService', [
    '$rootScope',
    '$window',
    '$cookies',
    '$http',
    function ($rootScope, $window, $cookies, $http) {
      let loggedIn = false
      let jwt

      this.setup = () => {
        $rootScope.globals = $rootScope.globals || {}
        $rootScope.globals.jwt = $cookies.get('jwt')

        // Set jwt in global if available
        if ($rootScope.globals.jwt) {
          $http.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${$rootScope.globals.jwt}`
          this.setCredentials($rootScope.globals.jwt)
        }
      }

      this.isLoggedIn = () => loggedIn

      this.setCredentials = (_jwt) => {
        jwt = _jwt
        loggedIn = true
      }

      this.getCredentials = () => jwt

      $rootScope.$on('state:update', (event, { type, status }) => {
        if (type === 'auth' && status === 'success') {
          loggedIn = true
          this.setup()
          $window.location.assign('#!/labels')
        }
      })

      $rootScope.$on('logout', () => {
        loggedIn = false
        $cookies.remove('jwt')
        $window.location.assign('/')
      })
    }
  ])
