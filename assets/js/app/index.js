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
    'ngCookies'
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
  .service('gmailService', function ($rootScope, $http, $location, $interval) {
    this.authenticate = () => {
      var req = {
        method: 'GET',
        url: '/api/auth/gmail'
      }

      $http(req).then((response) => {
        this.openLoginWindow(response.data.authUrl)
      }, (error) => {
        console.error(error)
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
            authWindow.close()
          }
        } catch (e) {
          // nothing
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

    // this.decodeJWT = () => {
    //   let decodedToken
    //   try {
    //     const verifiedToken = jwt.verify(token, 'ssssshhhhhh')
    //     if (verifiedToken) {
    //       decodedToken = jwt.decode(token, { complete: true })
    //       console.log('Decoded JWT:', decodedToken)
    //     }
    //   } catch (jwtError) {
    //     throw new Error(`Invalid JWT token: ${token}`)
    //   }
    // }
  })
