'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require('rxjs');

var _operators = require('rxjs/operators');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INIT_VAL = {};

var Subjects = function () {
  function Subjects() {
    var _this = this;

    _classCallCheck(this, Subjects);

    this.subjects = {
      props: new _rxjs.BehaviorSubject(INIT_VAL),
      context: new _rxjs.BehaviorSubject(INIT_VAL)
    };

    this.$ = (0, _rxjs.combineLatest)(this.subjects.props.pipe((0, _operators.filter)(function (x) {
      return x !== INIT_VAL;
    })).asObservable(), this.subjects.context.pipe((0, _operators.distinctUntilChanged)(), (0, _operators.filter)(function (x) {
      return x !== INIT_VAL;
    })).asObservable());

    this.ready = false;
    this.$.pipe((0, _operators.take)(1)).toPromise().then(function () {
      return _this.ready = true;
    });
  }

  _createClass(Subjects, [{
    key: 'props',
    value: function props(_props) {
      return this.subjects.props.next(_props);
    }
  }, {
    key: 'context',
    value: function context(_context) {
      return this.subjects.context.next(_context);
    }
  }]);

  return Subjects;
}();

exports.default = Subjects;