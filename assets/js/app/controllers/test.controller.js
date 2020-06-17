/**
 * Project: g-mail-management-app
 * FilePath: /client/app/controllers/testController/test.controller.js
 * File: test.controller.js
 * Created Date: Tuesday, June 16th 2020, 12:31:26 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2020 Pixel Ventures Ltd.
 * ------------------------------------
 */

angular.module('app')
  .controller('Controller1', function (
    $scope,
    $rootScope,
    $http,
    $cookies,
    $interval,
    gmailService
  ) {
    $scope.products = ['Milk', 'Bread', 'Cheese', 'Other']
    $scope.isLoggedInGmail = false
    $scope.isLoading = false

    $rootScope.$on('loadingGmailAuth', () => {
      $scope.isLoading = true
    })

    var gmailJWTCookie = null
    const cookieCheckInterval = $interval(() => {
      gmailJWTCookie = $cookies.get('gmail_jwt')
      $scope.isLoggedInGmail = gmailJWTCookie
      $scope.isLoading = false
    }, 1000)

    $scope.login = () => gmailService.authenticate()
  })
