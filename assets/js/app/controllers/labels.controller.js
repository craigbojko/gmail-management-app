/**
 * Project: g-mail-management-app
 * FilePath: /assets/js/app/controllers/labels.controller.js
 * File: labels.controller.js
 * Created Date: Sunday, June 21st 2020, 7:42:21 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2020 Pixel Ventures Ltd.
 * ------------------------------------
 */

angular.module('app')
  .controller('labelsController', ['$scope', '$rootScope', 'gmailService', function (
    $scope,
    $rootScope,
    gmailService
  ) {
    $scope.labels = []

    $scope.init = () => {
      $scope.loadLabels()
    }

    $rootScope.$on('event:fetch', (event, { status }) => {
      $scope.isLoading = status !== 'done'
    })

    $scope.loadLabels = () => {
      gmailService.fetchLabels().then(response => {
        $scope.labels = response.data
        $scope.$apply()
      })
    }

    $scope.init()
  }])
