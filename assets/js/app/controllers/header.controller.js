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
  .controller('headerNavController', ['$scope', '$rootScope', 'gmailService', function (
    $scope,
    $rootScope,
    gmailService
  ) {
    $scope.isLoggedInGmail = false
    $scope.isLoading = false

    $rootScope.$on('event:fetch', (event, { status }) => {
      $scope.isLoading = status !== 'done'
    })

    $scope.login = () => gmailService.authenticate()
  }])
