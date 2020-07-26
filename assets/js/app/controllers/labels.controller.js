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
  .controller('labelsController', ['$scope', '$rootScope', '$window', 'gmailService', function (
    $scope,
    $rootScope,
    $window,
    gmailService
  ) {
    $scope.rawLabels = []
    $scope.tree = []
    $scope.labels = {}

    $scope.init = () => {
      $scope.loadLabels()
    }

    $rootScope.$on('event:fetch', (event, { status }) => {
      $scope.isLoading = status !== 'done'
    })

    $scope.getTableRowClass = (label) => {
      const hasChildren = label.hasChildren !== 0 ? 'has-children' : ''
      return `level-${label.level + 1} ${hasChildren}`
    }

    $scope.toggleCollapse = (label) => {
      const currentLabel = $scope.labels[label.id]
      const newTree = { ...$scope.tree }
      const currentNode = $scope.traverseTree(newTree, label.fullName)
      const shouldCollapse = !currentNode._label.collapseChildren
      currentNode._label.collapseChildren = shouldCollapse

      Object.entries($scope.labels)
        .filter(([id, label]) => {
          const predicate = id !== currentLabel.id && !!~label.parents.indexOf(currentLabel.id)
          return predicate ? [id, label] : false
        })
        .map(([, label]) => {
          const node = $scope.traverseTree(newTree, label.fullName)
          if (node) {
            Object.assign(node, { _label: { ...node._label, collapsed: shouldCollapse } })
          }
        })

      const compiledLabels = $scope.compileLabelArray(newTree)
      $scope.tree = newTree
      $scope.labels = compiledLabels
      $window.tree = newTree
      $window.labels = $scope.labels
    }

    $scope.findTreeNode = (tree, path) => {
      // const node
    }

    $scope.traverseTree = (tree, path) => {
      const branches = path.split('/')
      const numberOfBranches = branches.length
      let branchId = 0
      let currentPath = ''
      let position = tree

      if (numberOfBranches <= 1 && branches[0]) {
        if (!tree[branches[0]]) {
          tree[branches[0]] = {}
        }
        return tree[branches[0]]
      }

      while (branchId < numberOfBranches) {
        const leaf = branches[branchId]

        if (!position[leaf]) { // if we don't have a leaf, create one
          position[leaf] = {
            _label: {
              name: leaf,
              fullName: `${currentPath}/${leaf}`,
              id: `temp_${leaf}`,
              collapsed: false
            }
          }
        }
        if (branchId === numberOfBranches - 1) { // we're on the last part of the path
          return position[leaf] // return the leaf at the path
        }

        position = position[leaf]
        currentPath = currentPath === '' ? `${branches[branchId]}` : `${currentPath}/${branches[branchId]}`
        branchId++
      }
    }

    $scope.buildLabelTree = (labels) => {
      $scope.rawLabels = labels.sort((a, b) => {
        return a.name.localeCompare(b.name)
      }).sort((a) => {
        return a.type === 'system' ? -1 : 0
      })
      const tree = {}

      labels.forEach(label => {
        // const labelSections = label.name.split('/')
        // const shortLabelName = labelSections[labelSections.length - 1]
        const node = $scope.traverseTree(tree, label.name)

        Object.assign(node, {
          _label: {
            collapsed: false,
            ...label // overwrite with our label data
          }
        })
      })
      return tree
    }

    $scope.compileLabelArray = (tree) => {
      const array = []

      function levelOut (tree, level = 0, parent, parents = []) {
        Object.entries(tree).map(([label, obj]) => {
          const { _label = {}, ...subLabels } = obj
          const hasChildren = subLabels && Object.keys(subLabels).length
          const parentId = parent ? parent.id : null
          const _parents = [...parents]
          if (parentId && !~parents.indexOf(parentId)) {
            _parents.push(parentId)
          }

          if (!_label || !_label.id) {
            console.warn('No _label', label, obj)
          }

          array.push(
            [
              (_label.id || `temp_${label}`),
              {
                ..._label,
                fullName: _label.fullName || _label.name,
                name: label,
                parent: parent,
                parents: _parents,
                level,
                hasChildren
              }
            ]
          )

          if (hasChildren) {
            levelOut(subLabels, level + 1, _label, _parents)
          }
        })
      }
      levelOut(tree)
      return Object.fromEntries(array)
    }

    $scope.loadLabels = () => {
      gmailService.fetchLabels().then(response => {
        $window.rawLabels = response.data
        const tree = $scope.buildLabelTree(response.data)
        const labels = $scope.compileLabelArray(tree)

        $scope.tree = tree
        $scope.labels = labels
        $window.tree = tree
        $window.labels = labels

        $scope.$apply()
      })
    }

    $scope.init()
  }])
  .directive('labelList', function () {
    return {
      restrict: 'E',
      templateUrl: 'templates/labelList.html',
      link: function (scope, element, attrs) {
        if (attrs.labels) {
          scope.labelRows = scope.$eval(attrs.labels)
        }
      }
    }
  })
