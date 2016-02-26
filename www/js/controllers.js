/**
 * This file defines all the controllers for the application
 *
 * @author      ritesh
 * @version     1.0
 */
(function() {
  'use strict';
  var controllers = angular.module('billid.controllers', []);

  controllers.controller('AppController', ['$scope', 'ApplicationStorage', '$state', function($scope, ApplicationStorage, $state) {
    $scope.logout = function() {
      ApplicationStorage.clear();
      $state.go('login');
    };
    $scope.profile = ApplicationStorage.getUserProfile();
  }]);

  controllers.controller('LoginController', ['$scope', '$state', 'Auth', function($scope, $state, Auth) {
    $scope.login = function(credentials) {
      $scope.error = false;
      $scope.errorMessage = '';
      if(credentials && credentials.username && credentials.password) {
        Auth.login(credentials).then(function(payload) {
          $state.go('app.receipts');
        }, function(reason) {
          if(reason.status === 401) {
            $scope.error = true;
            $scope.errorMessage = 'Invalid username or password';
          }
        });
      } else {
        $scope.error = true;
        $scope.errorMessage = 'Enter username and password';
      }
    };
  }]);

  controllers.controller('RegisterController', ['$scope', '$state', 'Registration', '$cordovaToast', '$log', function($scope, $state, Registration, $cordovaToast, $log) {
    $scope.user = {
      country: {
        name: ''
      }
    };
    $scope.register = function(user) {
      Registration.register(user).then(function() {
        $cordovaToast.showLongBottom('Registered successfully');
        $state.go('login');
      },function(reason) {
        $log.error('Unexpected error ' + angular.toJson(reason));
        $cordovaToast.showLongBottom('Failed to register');
      });
    };
  }]);

  controllers.controller('ReceiptsController', ['$scope', 'myReceipts', '$state', function($scope, myReceipts, $state) {
    $scope.receiptsList = myReceipts;

    $scope.showDetail = function(receipt) {
      $state.go('app.receiptDetail', { id: receipt.id });
    };
  }]);
  controllers.controller('ReceiptDetailController', ['$scope', 'receipt', function($scope, receipt) {
    $scope.receipt = receipt;
  }]);

  controllers.controller('SettingsController', ['$scope', 'Registration', 'Logger', '$cordovaToast', function($scope, Registration, Logger, $cordovaToast){
    $scope.settings = {
      enableNotification: false
    };
    $scope.saveSettings = function(settings) {
      if(settings.enableNotification) {
        Registration.registerDevice();
      } else {
        $cordovaToast.showLongBottom('Unregistered from notifications');
      }
    };
  }]);
}());
