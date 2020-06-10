'use strict';

(function() {
  var window = this;
  var $ = window.jQuery;
  var rand = function rand(n) {
    return Math.floor(Math.random() * n);
  };

  var Arithmetic = {
    init: function init(options) {
      var problem_start_time = void 0;
      var game = $('#game');
      var d_left = game.find('.left');
      var correct = game.find('.correct');
      var banner = game.find('.banner');
      var problem = game.find('.problem');
      var answer = game.find('.answer');
      var body = $('body');
      answer.focus();

      var wls = window.location.search;

      var randGen = function randGen(min, max) {
        return function() {
          return min + rand(max - min + 1);
        };
      };

      var genTypes = ['add_left', 'add_right', 'mul_left', 'mul_right'];
      var randGens = {};
      genTypes.forEach(function(type) {
        randGens[type] = randGen(
          options[type + '_min'],
          options[type + '_max']
        );
      });

      var pg_add = function pg_add() {
        var left = randGens[genTypes[0]]();
        var right = randGens[genTypes[1]]();
        return [left + ' + ' + right, left + right];
      };
      var pg_sub = function pg_sub() {
        var left = randGens[genTypes[0]]();
        var right = randGens[genTypes[1]]();
        return [left + right + ' \u2013 ' + left, right];
      };
      var pg_mul = function pg_mul() {
        var left = randGens[genTypes[2]]();
        var right = randGens[genTypes[3]]();
        return [left + ' \xD7 ' + right, left * right];
      };
      var pg_div = function pg_div() {
        var left = randGens[genTypes[2]]();
        var right = randGens[genTypes[3]]();
        if (left !== 0) {
          return [left * right + ' \xF7 ' + left, right];
        }
      };

      var pgs = [];
      if (options.add) {
        pgs.push(pg_add);
      }
      if (options.sub) {
        pgs.push(pg_sub);
      }
      if (options.mul) {
        pgs.push(pg_mul);
      }
      if (options.div) {
        pgs.push(pg_div);
      }

      var problemGen = function problemGen() {
        var genned = void 0;
        while (genned == null) {
          genned = pgs[rand(pgs.length)]();
        }
        return genned;
      };

      var genned = null;
      var problemGeng = function problemGeng() {
        genned = problemGen();
        problem.text(genned[0]);
        answer.val('');
      };

      var start_time = (problem_start_time = Date.now());
      var correct_ct = 0;
      var correct_info = [];
      var cb = function cb(e) {
        var str_ans = '' + genned[1];
        if ($.trim($(this).val()) === str_ans) {
          // || e.keyCode == 13
          var now = Date.now();
          correct_info.push([
            genned[0],
            genned[1],
            Math.floor(now - problem_start_time)
          ]);
          problem_start_time = now;
          problemGeng();
          correct.text('Score: ' + ++correct_ct);
        }
        return true;
      };
      answer.keydown(cb).keyup(cb);

      problemGeng();

      var duration = options.duration || 120;
      d_left.text('Seconds left: ' + duration);
      var timer = setInterval(function() {
        var d = duration - Math.floor((Date.now() - start_time) / 1000);
        d_left.text('Seconds left: ' + d);

        if (d <= 0) {
          correct_info.push([genned[0], genned[1], -1]);
          var json = JSON.stringify(correct_info);
          answer.prop('disabled', true);
          var $doc = $(window.document);
          var bsEat = function bsEat(e) {
            return e.keyCode !== 8;
          };
          $doc.keydown(bsEat);
          clearInterval(timer);

          $.post(
            '/log',
            {
              key: wls.match(/key=([0-9a-f]{8})/)[1],
              problems: json
            },
            function(data) {
              setTimeout(function() {
                return $doc.unbind('keydown', bsEat);
              }, 1000);
              banner.find('.start').hide();
              return banner.find('.end').show();
            },
            'html'
          );
        }
      }, 1000);

      if (wls.match(/\bpink\b/)) {
        $('.banner').css('background', 'pink');
      }
    }
  };

  window.Arithmetic = Arithmetic;
}).call(this);
