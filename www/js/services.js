/**
 * This file defines all the services for the application
 *
 * @author      ritesh
 * @version     1.0
 */
(function(ionic) {
  'use strict';
  var appServices = angular.module('billid.services', []);
  /**
   * Common utility service
   */
  appServices.factory('util', ['RequestHelper', '$state', 'BASE_URL', '$http', 'Logger', '$cordovaDialogs', 'APP_CONSTANTS', function(RequestHelper, $state, BASE_URL, $http, Logger, $cordovaDialogs, APP_CONSTANTS) {
    var service = {};
    service.isAndroid = function() {
      return ionic.Platform.isAndroid();
    };
    service.isIos = function() {
      return ionic.Platform.isIOS();
    };
    service.handleIos = function(event, notification) {
      Logger.info(notification, 'ios GCM notification received');
      if (notification.alert) {
        navigator.notification.alert(notification.alert);
      }
      if (notification.sound) {
        var snd = new Media(event.sound);
        snd.play();
      }
      if(notification.badge) {
        $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
          // Success!
        }, function(err) {
          Logger.error(err, 'Error setting badge number');
        });
      }
    };
    service.handleAndroid = function(event, notification) {
      Logger.info(notification, 'android GCM notification received');
      switch (notification.event) {
        case APP_CONSTANTS.ANDROID_NOTIFICATION_EVENT_TYPES.message:
          var messageObject = angular.fromJson(notification);
          $cordovaDialogs.alert(messageObject.payload.message, messageObject.payload.title);
          $state.go('app.receiptDetail', { id: messageObject.payload.data.receiptId });
          break;
        case APP_CONSTANTS.ANDROID_NOTIFICATION_EVENT_TYPES.error:
          Logger.error(notification, 'GCM error event');
        default:
          Logger.error(notification, 'Unrecognized GCM event');
          break;
      }
    };
    service.registerHandler = function(user) {
      var req = {
        url: BASE_URL + '/users',
        method: 'POST',
        data: user
      };
      return $http(req);
    };
    return service;
  }]);

  appServices.service('RegistrationMock', ['BASE_URL', '$http', 'RequestHelper', 'Logger', function(BASE_URL, $http, RequestHelper, Logger) {
    var service = {};
    service.register = function(user) {
      return RequestHelper.execute ({
        url: BASE_DEV_URL + '/registerRegistration.json'
      });
    };
    return service;
  }]);
  appServices.service('RegistrationProduction', ['$rootScope', '$cordovaToast', 'util', '$cordovaPush', 'Logger', 'APP_CONSTANTS', 'Profiles', function($rootScope, $cordovaToast, util, $cordovaPush, Logger, APP_CONSTANTS, Profiles) {
    var service = {};
    service.registerDevice = function() {
      var config;
      // register with gcm
      if(util.isAndroid()) {
        config = {
          'senderID': APP_CONSTANTS.GCM_SENDER_ID
        };
      } else if(util.isIos()) {
        config = {
          'badge': true,
          'sound': true,
          'alert': true,
        };
      }
      /**
       * Add event handler
       */
      $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
        Logger.info(notification, 'Notification received');
        if(util.isAndroid()) {
          // if notification type is registered only than it needs to be handled here, otherwise we can delegate
          if(notification.event === APP_CONSTANTS.ANDROID_NOTIFICATION_EVENT_TYPES.registered) {
            Profiles.updateDevice(notification.regid, APP_CONSTANTS.DEVICE_TYPES.android).then(function(payload) {
              $cordovaToast.showLongBottom('Registered for push notification');
              Logger.info(payload, 'Successfully updated the device info');
            }, function(reason) {
              Logger.error(reason, 'Failed to update device info');
              $cordovaToast.showLongBottom('Failed to register for push notification');
            });
          } else {
            util.handleAndroid(event, notification);
          }
        } else if(util.isIos()) {
          util.handleIos(event, notification);
        } else {
          Logger.error(new Error('Not supported'), 'Platform not supported');
        }
      }, false);
      $cordovaPush.register(config).then(function(result) {
        Logger.info(result, 'Registered for push notifications from GCM');
        // if device type is ios
        if(util.isIos()) {
          Profiles.updateDevice(regid, APP_CONSTANTS.DEVICE_TYPES.ios).then(function(payload) {
            Logger.info(payload, 'Successfully updated the device info');
            $cordovaToast.showLongBottom('Registered for push notification');
          }, function(reason) {
            Logger.error(reason, 'Failed to update device info');
            $cordovaToast.showLongBottom('Failed to register for push notification');
          });
        }
      });
    };
    /**
     * Register a user
     * The user will be registered with GCM server to get the registration id and then will be registered with billid server
     */
    service.register = function(user) {
      user.type = APP_CONSTANTS.USER_TYPES.customer;
      return util.registerHandler(user);
    };
    return service;
  }]);
  appServices.factory('Registration', ['ServicesResolver', 'APP_CONSTANTS', function(ServicesResolver, APP_CONSTANTS) {
    return ServicesResolver.getService(APP_CONSTANTS.SERVICES.Registration);
  }]);
}(ionic));
