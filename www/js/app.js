/**
 * Angular application file.
 * All the application bootstrapping, configuration, run goes here
 *
 * @author      ritesh
 * @version     1.0
 */
(function() {
  'use strict';
  angular.module('billid', ['ionic', 'angularMoment', 'rn-lazy', 'ngCordova','billid.controllers', 'billid.services', 'billid.filters', 'billidpoc'])
  .constant('ENVIRONMENT', 'STAGING')
  .constant('BASE_URL', 'https://receiptz-api.herokuapp.com')
  .run(function($ionicPlatform, Auth, $state) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      // if user is authenticated go to receipts
      if(Auth.isAuthenticated()) {
        $state.go('app.receipts');
      }
    });
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: "templates/login.html",
      controller: 'LoginController'
    })
    .state('register', {
      url: '/register',
      templateUrl: "templates/register.html",
      controller: 'RegisterController'
    })
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppController'
    })
    .state('app.receipts', {
      url: "/receipts",
      resolve: {
        myReceipts: function(Receipts) {
          return Receipts.me();
        }
      },
      views: {
        'menuContent': {
          templateUrl: "templates/receipts.html",
          controller: 'ReceiptsController'
        }
      }
    })
    .state('app.receiptDetail', {
      url: "/receipt/:id",
      resolve: {
        receipt: function(Receipts, $stateParams) {
          return Receipts.get($stateParams.id);
        }
      },
      views: {
        'menuContent': {
          templateUrl: "templates/receiptDetail.html",
          controller: 'ReceiptDetailController'
        }
      }
    })
    .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent': {
          templateUrl: "templates/settings.html",
          controller: 'SettingsController'
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
}());
