/* global $, options, changeMonkeyType, Monkey */

'use strict';

describe('Loading Monkey', function () {
  var promise, promiseBeforeHtml, monkeyData;

  var $testObject = $('<div />').attr({
    'data-key': 'lmn-book',
    'data-name': 'Test',
    'data-gender': 'boy',
    'data-locale': 'en-US',
    'data-icons': true
  });

  var monkey = new Monkey($testObject);

  var options = monkey.options;

  var $events = $({});

  it('should set book options from data attributes (slow)', function () {
    return monkey.promise.then(function () {
      monkey.options.book.name.should.equal('Test');
      monkey.options.book.gender.should.equal('boy');
      monkey.options.book.locale.should.equal('en-US');
    });
  });

  it('should get data', function () {
    Monkey.should.have.property('_getData');
    promise = Monkey._getData(monkey.options);
    promise.should.be.jqPromise;

    return promise.then(function (data) {
      monkeyData = data;

      data.should.have.property('name');
      data.should.have.property('gender');
      data.should.have.property('locale');
      data.letters.should.be.an.Array;
      data.letters.length.should.be.above(10);

      data.should.not.have.property('urls');
      data.should.not.have.property('html');
    });
  });

  it('should set monkeyType', function () {
    promise = promise.then(Monkey._calculateMonkey());
    promiseBeforeHtml = promise;

    return promise.then(function (data) {
      data.should.have.property('monkeyType');
      data.monkeyType.should.match(/desktop|mobile/);
    });
  });

  it('should set monkeyType with option desktop', function () {
    return promise.then(Monkey._calculateMonkey('desktop'))
      .then(function (data) {
        data.should.have.property('monkeyType');
        data.monkeyType.should.equal('desktop');
      });
  });

  it('should set monkeyType with option auto', function () {
    return promise.then(Monkey._calculateMonkey('auto'))
      .then(function (data) {
        data.should.have.property('monkeyType');
        data.monkeyType.should.match(/desktop|mobile/);
      });
  });

  it('should generate URLs', function () {
    promise = promise.then(Monkey._generateUrls(1));

    return promise.then(function (data) {
      data.should.have.property('urls');
      data.urls.should.have.length(data.letters.length);

      for (var i = 0; i < data.urls.length; i++) {
        var url = data.urls[i];

        url.should.be.a.String;
        url.should.startWith('//');

        url.length.should.be.above(50);
        url.should.match(/[?&][hw]=\d+/);
      }
    });
  });

  /*
  it('should have preloaded the first image', function () {
    this.timeout(10);

    return Monkey.helpers.preload(monkeyData.urls[0]);
  });

  it('should not have preloaded the tenth image', function (cb) {
    var finished = false;
    Monkey.helpers.preload(monkeyData.urls.slice(0, 11))
      .then(function () {
        finished = true;
      });

    setTimeout(function () {
      finished.should.be.False;
      cb();
    }, 30);
  });
  */

  it('should generate HTML for desktop', function () {
    return promise.then(changeMonkeyType('desktop'))
      .then(Monkey._generateHtml(options.lang))
      .then(function (data) {
        data.should.have.property('html');
        data.html.should.be.jQuery;
        data.html.hasClass('desktop').should.be.True;
        data.html.html().should.containEql(data.urls[2].split('?')[0]);
      });
  });

  it('should generate HTML for mobile', function () {
    return promise.then(changeMonkeyType('mobile'))
      .then(Monkey._generateHtml(options.lang))
      .then(function (data) {
        data.should.have.property('html');
        data.html.should.be.jQuery;
        data.html.hasClass('mobile').should.be.True;
        data.html.html().should.containEql(data.urls[2].split('?')[0]);
      });
  });

  it('should insert HTML correctly on desktop', function () {
    var $book = $('<div />').attr('data-key', 'lmn-book');
    $book.children().length.should.equal(0);

    return promise.then(changeMonkeyType('desktop'))
      .then(Monkey._generateHtml(options.lang))
      .then(Monkey._initMonkey($events, options))
      .then(Monkey._insertHtml($book))
      .then(function (data) {
        $book.children().length.should.not.equal(0);

        $book.find('img').length.should.equal(data.urls.length * 2);

        data.should.have.property('container');
      });
  });

  it('should insert HTML correctly on mobile', function () {
    var $book = $('<div />').attr('data-key', 'lmn-book');
    $book.children().length.should.equal(0);

    return promise.then(changeMonkeyType('mobile'))
      .then(Monkey._generateHtml(options.lang))
      .then(Monkey._initMonkey($events, options))
      .then(Monkey._insertHtml($book))
      .then(function (data) {
        $book.children().length.should.not.equal(0);

        $book.find('img').length.should.equal(data.urls.length);

        data.should.have.property('container');
      });
  });

  it('should remove existing HTML', function () {
    var $book = $('<div />').attr('data-key', 'lmn-book').html('<br><br>');
    $book.children().length.should.equal(2);

    return promise
      .then(Monkey._generateBaseElement($book, options))
      .then(Monkey._insertHtml($book))
      .then(function () {
        $book.children('br').length.should.equal(0);
      });
  });

  it('should generate letters HTML correctly', function () {
    promise = promise.then(Monkey.letters._generateHtml(options));

    return promise.then(function (data) {
      var spans = data.lettersElement.find('.letter');
      var spansToAdd = data.name.length < 5 ? 3 : 2;
      spans.length.should.equal(data.name.length + spansToAdd);
    });
  });

  it('should generate letters HTML with short names correctly (slow)', function () {
    var monkey = new Monkey($('<div />').attr('data-key', 'lmn-book'), {
      letters: true,
      book: {
        name: 'Tal',
        gender: 'boy',
        locale: 'en-GB'
      }
    });

    return monkey.promise.then(function (data) {
      var spans = data.lettersElement.find('.letter');
      spans.length.should.equal(6);
    });
  });

  it('should generate letters HTML with special chars correctly (slow)', function () {
    var monkey = new Monkey($('<div />').attr('data-key', 'lmn-book'), {
      book: {
        name: 'Maë-Lily',
        gender: 'girl',
        locale: 'en-GB'
      },
      server: 'https://chameleon.lostmy.name/preview.json?callback=?',
      icons: true
    });

    return monkey.promise.then(function (data) {
      var spans = data.lettersElement.find('.letter');
      spans.length.should.equal(10);
      spans.filter(':contains("Ë")').length.should.equal(1);
      spans.filter(':contains("-")').length.should.equal(1);
    });
  });

  // Can't insert it because it already exists :(
  it('should generate spread HTML (slow)', function () {
    return promise.then(function (data) {
      data.should.not.have.property('needsSpread');

      var spreadPromise = Monkey.spread._getData(data, options);

      var $monkey = data.html;
      $monkey.scrollLeft($monkey.children('div').width() / 2 + 1000);
      $monkey.triggerHandler('scroll.monkeyPoll');

      return spreadPromise.then(function (monkeyData, spreadUrl) {
        monkeyData.should.equal(data);
        spreadUrl.should.containEql('TEST.jpg');
      });
    });
  });

  it('should generate html for icons', function () {
    promise = promise.then(Monkey.letters._generateHtml(options));

    return promise.then(function (data) {
      var spans = data.lettersElement.find('.character-card');
      spans.length.should.equal(data.name.length);
    });
  });

  it('should initiate letters correctly', function () {
    Monkey.monkeys.test = {
      letterHandler: function () {}
    };

    promise = promise.then(changeMonkeyType('test'))
      .then(Monkey.letters._init($events, options));

    return promise.then(function (data) {
      $events.trigger('letterChange', 7);
      data.lettersElement.find('.letter-active').index().should.equal(3);
    });
  });

  it('should have a constructor function that accept options', function () {
    var $testObject = $('<div />').attr('data-key', 'lmn-book');

    var monkey = new Monkey($testObject, {
      letters: false,
      monkeyType: 'mobile',
      book: options.book
    });

    return monkey.promise.then(function (data) {
      $testObject.children().length.should.be.above(0);
      data.html[0].should.equal($testObject.children()[0]);
    });
  });

  it('should generate icons for short, hephenated names correctly (slow)', function () {
    var monkey = new Monkey($('<div />').attr('data-key', 'lmn-book'), {
      letters: true,
      book: {
        name: 'Lee-T',
        gender: 'girl',
        locale: 'en-GB'
      }
    });

    return monkey.promise
    .then(Monkey.letters._generateHtml(options))
    .then(function (data) {
      var spans = data.lettersElement.find('.character-card');
      spans.length.should.equal(4);
    });
  });

  it('should generate letters for names with spaces (slow)', function () {
    var monkey = new Monkey($('<div />').attr('data-key', 'lmn-book'), {
      book: {
        name: 'Lee T',
        gender: 'girl',
        locale: 'en-GB'
      }
    });

    return monkey.promise
    .then(Monkey.letters._generateHtml(options))
    .then(function (data) {
      var spans = data.lettersElement.find('.letter');
      // 4 stories + 1 bridge + 1 space + 2 covers
      spans.length.should.equal(8);
      spans.find('.char')[4].should.match(/ /);
    });
  });
});
