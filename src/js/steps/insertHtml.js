'use strict';

var $ = require('jquery');

/**
 * Inserts HTML into specified container.
 *
 * @param {string|HTMLElement|jQuery} monkeyContainer The container.
 */
module.exports = function (monkeyContainer) {
  var $container = $(monkeyContainer);

  return function (data) {
    $container
      .addClass('loaded')
      .removeClass('loading')
      .append(data.html);

    data.container = $container;

    return data;
  };
};
