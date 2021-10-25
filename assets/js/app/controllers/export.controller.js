/**
 * Project: g-mail-management-app
 * FilePath: /assets/js/app/controllers/export.controller.js
 * File: export.controller.js
 * Created Date: Friday, March 19th 2021, 11:16:48 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified: Mon Mar 29 2021
 * Modified By: Craig Bojko
 * -----
 * Copyright (c) 2021 Pixel Ventures Ltd.
 * ------------------------------------
 */

angular
  .module('app')
  .controller('exportController', [
    '$scope',
    '$rootScope',
    '$location',
    '$window',
    'gmailExportService',
    function ($scope, $rootScope, $location, $window, exportService) {
      $scope.config = {
        exportParams: {
          count: 100
        }
      }

      $scope.export = () =>
        exportService
          .export($scope.config.exportParams.count)
          .then((response) => {
            $scope.data = JSON.stringify(response, null, 2)
            $window.exportData = response

            $scope.$apply()
          })
    }
  ])
  .service('gmailExportService', [
    '$rootScope',
    '$timeout',
    function ($rootScope, $timeout) {
      this.export = async (limit = 100) => {
        try {
          const showLoadingTTL = 5
          $rootScope.$emit('event:fetch', {
            type: 'export',
            status: 'in_progress',
            ttl: showLoadingTTL
          })
          const url = `/api/gmail/export?limit=${limit}`
          const WINDOW_WIDTH = 300
          const WINDOW_HEIGHT = 200
          // const screenWidth = window.screen.width
          // const screenHeight = window.screen.height
          const leftPosition = 100 // screenWidth / 2 - WINDOW_WIDTH / 2
          const topPosition = 100 // screenHeight / 2 - WINDOW_HEIGHT / 2
          window.open(
            url,
            'Export Window',
            `width=${WINDOW_WIDTH}, \
            height=${WINDOW_HEIGHT}, \
            left=${leftPosition}, \
            top=${topPosition}, \
            menubar=0, \
            toolbar=0, \
            location=0, \
            status=0, \
            resizable=0`
          )

          $timeout(() => {
            $rootScope.$emit('event:fetch', {
              type: 'export',
              status: 'done'
              // payload: response
            })
          }, (showLoadingTTL + 1) * 1000)
        } catch (error) {
          $rootScope.$emit('event:fetch', {
            type: 'export',
            status: 'failed',
            payload: error
          })
          throw new Error(error.message || error)
        }
        // const callbackCheck = $interval(() => {
        //   try {
        //     const url = authWindow.document.URL
        //     if (url.indexOf('/api/auth/callback') !== -1) {
        //       $interval.cancel(callbackCheck)
        //       $timeout(authWindow.close, 1000)
        //       $rootScope.$emit('state:update', {
        //         type: 'auth',
        //         status: 'success'
        //       })
        //     }
        //   } catch (error) {
        //     $rootScope.$emit('state:update', {
        //       type: 'auth',
        //       status: 'failed',
        //       error
        //     })
        //   }
        // }, 500)
      }
    }
  ])
