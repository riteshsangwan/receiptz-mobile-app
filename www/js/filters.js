/**
 * Filter definitions for the application
 *
 * @author      hari
 * @version     1.0
 */
(function(ionic) {
  'use strict';
  var filters = angular.module('billid.filters', ['angularMoment']);

  /**
   * Returns a date from a mongodb object id
   */
  filters.filter('dateFromObjectId', function(){
    return function(oid) {
      return new Date(parseInt(oid.substring(0,8), 16)*1000);
    };
  });

  /**
   * Returns a formatted date from a mongodb object id,
   * the date format is hard coded as of now for the poc purposes
   */
  filters.filter('formattedDateFromObjectId', ['$filter', function($filter){
  return function(oid) {
    var dt = $filter('dateFromObjectId')(oid);
    return $filter('amDateFormat')(dt, 'dddd, MMMM Do YYYY, h:mm:ss a');
  }
  }]);
}(ionic));
