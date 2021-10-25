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

angular.module('app').controller('headerNavController', [
  '$scope',
  '$rootScope',
  '$location',
  '$timeout',
  '$interval',
  'authService',
  function ($scope, $rootScope, $location, $timeout, $interval, authService) {
    $scope.isLoading = false
    $scope.isLoadingFinite = false
    $scope.isLoadingFiniteValue = false
    $scope.currentNavItem = $location.$$path.substring(1)

    $rootScope.$on('event:fetch', (event, { status, ttl }) => {
      const shouldShowLoading = status === 'in_progress'
      if (!shouldShowLoading) {
        $scope.isLoading = false
        $scope.isLoadingFinite = false
        return
      }

      const isFinite = Boolean(ttl)
      const interval = 1000 // 1s

      if (isFinite) {
        $scope.isLoadingFinite = true
        $scope.isLoadingFiniteValue = 0
        const loading = $interval(() => {
          $scope.isLoadingFiniteValue = $scope.isLoadingFiniteValue += 100 / ttl
        }, interval)

        $timeout(() => {
          $interval.cancel(loading)
        }, (ttl + 1) * interval)
      } else {
        $scope.isLoading = true
      }
    })

    $scope.logout = () => $rootScope.$emit('logout')

    $scope.isLoggedIn = () => authService.isLoggedIn()
  }
])
