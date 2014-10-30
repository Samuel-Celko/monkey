window.monkey = module.exports = (function () {
  'use strict';

  var monkey = {};
  monkey._urls = require('./urls');

  /**
   * Initiate monkey; generate it, and then insert it into the page.
   *
   * @param {string|HTMLElement|jQuery} monkeyContainer Container for monkey.
   * @returns A promise that will be resolved when monkey is ready.
   */
  monkey.init = function (monkeyContainer) {
    return monkey._getData()
      .then(monkey._generateUrls())
      .then(monkey._calculateMonkey())
      .then(monkey._generateHtml())
      .then(monkey._initMonkey())
      .then(monkey._insertHtml(monkeyContainer));
  };

  monkey._getData = require('./steps/getData');
  monkey._generateUrls = require('./steps/generateUrls');
  monkey._calculateMonkey = require('./steps/calculateMonkey');
  monkey._generateHtml = require('./steps/generateHtml');
  monkey._initMonkey = require('./steps/initMonkey');
  monkey._insertHtml = require('./steps/insertHtml');

  monkey.helpers = {};
  monkey.helpers.handleReplace = require('./helpers/handleReplace');
  monkey.helpers.isMobile = require('./helpers/isMobile');

  monkey.monkeys = {};
  monkey.monkeys.mobile = require('./monkeys/mobile');
  monkey.monkeys.desktop = require('./monkeys/desktop');

  return monkey;
})();