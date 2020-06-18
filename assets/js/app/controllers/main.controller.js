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
  .controller('Main', function (
    $scope,
    $rootScope,
    gmailService
  ) {
    $scope.isLoggedInGmail = false
    $scope.isLoading = false
    $scope.labels = []

    $rootScope.$on('event:fetch', (event, { status }) => {
      $scope.isLoading = status !== 'done'
    })

    $scope.login = () => gmailService.authenticate()

    $scope.loadLabels = () => {
      gmailService.fetchLabels().then(response => {
        $scope.labels = response.data
        $scope.$apply()
      })
    }
  })
