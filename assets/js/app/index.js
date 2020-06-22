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
    'ngRoute',
    'ngCookies',
    'ngMessages',
    'ngMaterial'
  ])
  .component('headerNav', {
    templateUrl: 'templates/header.html',
    controller: 'headerNavController'
  })
  .component('labelsComponent', {
    templateUrl: '/templates/labels.html',
    controller: 'labelsController'
  })
  .component('filtersComponent', {
    // templateUrl: '/templates/filters.html',
    // controller: 'Main'
    template: '<p>Filters View</p>',
    controller: function () {}
  })
  .component('authenticationComponent', {
    templateUrl: '/templates/login.html',
    controller: 'authenticationController'
  })
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/login', { template: '<authentication-component></authentication-component>' })
      .when('/labels', { template: '<labels-component></labels-component>' })
      .when('/filters', { template: '<filters-component></filters-component>' })
      .otherwise({
        redirectTo: '/labels'
      })
  }])
  .service('gmailService', ['$rootScope', '$http', '$timeout', '$interval', function ($rootScope, $http, $timeout, $interval) {
    this.authenticate = () => {
      var req = {
        method: 'GET',
        url: '/api/auth/gmail'
      }

      $http(req).then((response) => {
        this.openLoginWindow(response.data.authUrl)
        $rootScope.$emit('state:update', { type: 'auth', status: 'in_progress' })
      }, (error) => {
        $rootScope.$emit('state:update', { type: 'auth', status: 'failed', error })
      })
    }

    this.openLoginWindow = (authUrl) => {
      const WINDOW_WIDTH = 800
      const WINDOW_HEIGHT = 600
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      const leftCenter = screenWidth / 2 - (WINDOW_WIDTH / 2)
      const topCenter = screenHeight / 2 - (WINDOW_HEIGHT / 2)
      const authWindow = window.open(
        authUrl,
        'Authentication Window',
        `width=${WINDOW_WIDTH}, height=${WINDOW_HEIGHT}, left=${leftCenter}, top=${topCenter}, menubar=0, toolbar=0, location=0, status=0, resizable=0`
      )

      const callbackCheck = $interval(() => {
        try {
          const url = authWindow.document.URL
          if (url.indexOf('/api/auth/callback') !== -1) {
            $interval.cancel(callbackCheck)
            $timeout(authWindow.close, 1000)
            $rootScope.$emit('state:update', { type: 'auth', status: 'success' })
          }
        } catch (error) {
          $rootScope.$emit('state:update', { type: 'auth', status: 'failed', error })
        }
      }, 500)
    }

    this.isAuthenticated = () => {
      var req = {
        method: 'GET',
        url: '/api/auth/gmail/check'
      }

      $http(req).then((response) => {
        // done
      }, (error) => {
        console.error(error)
      })
    }

    this.fetchLabels = async () => {
      var req = {
        method: 'GET',
        url: '/api/gmail/labels'
      }

      try {
        $rootScope.$emit('event:fetch', { type: 'labels', status: 'in_progress' })
        const response = await $http(req)
        $rootScope.$emit('event:fetch', { type: 'labels', status: 'done', payload: response })
        return response.data
      } catch (error) {
        $rootScope.$emit('event:fetch', { type: 'labels', status: 'failed', error })
        throw new Error(error.message || error)
      }
    }
  }])
  .run(run)

run.$inject = ['$rootScope', '$location', '$cookies', '$http', 'authService']
function run ($rootScope, $location, $cookies, $http, authService) {
  authService.setup()

  $rootScope.$on('$locationChangeStart', function (event, next, current) {
    console.log('REDIRECTION IN RUN: ', next, current)

    // redirect to login page if not logged in and trying to access a restricted page
    var restrictedPage = true;
    ['/login', '/register'].forEach((page) => {
      if (page === $location.path()) {
        restrictedPage = false
      }
    })

    // var loggedIn = $rootScope.globals.currentUser
    if (restrictedPage && !authService.isLoggedIn()) {
      $location.path('/login')
    }
  })
}

