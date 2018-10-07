'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require('rxjs');

var _operators = require('rxjs/operators');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ERR = {
  NOT_PROVIDED: new Error("Komfu instance hasn't been provided for yet: komfu.provide(props$, providers$)."),
  NOT_INITIALIZED: new Error('Komfu instance has not been initialized yet.')
};

var Komfu = function () {
  function Komfu(middleware, collection) {
    var _this = this;

    _classCallCheck(this, Komfu);

    Object.entries(middleware).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      if (typeof value === 'function') _this[key] = value.bind(_this);else _this[key] = value;
    });

    this.options = Object.assign({
      pure: false
    }, middleware.options || {});

    this.collection = collection || null;
    this.initialized = false;
    this.provided = false;
  }

  _createClass(Komfu, [{
    key: 'provide',
    value: function provide(in$) {
      var _this2 = this;

      this.in$ = in$;
      var stream$ = this.stream(in$);

      if (this.options.pure) {
        // PURE
        this.out$ = stream$;
      } else {
        // NOT PURE
        var _next = void 0;
        var subject = new _rxjs.Subject();
        var obs = _rxjs.Observable.create(function (obs) {
          _next = obs.next.bind(obs);
          _this2.change(_this2.props, _this2.providers);
          _next = subject.next.bind(subject);
        });
        var setNext = function setNext(inProps, providers) {
          _this2.next = function next(props) {
            var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                merge = _ref3.merge;

            var promise = new Promise(function (resolve) {
              return _resolveQueue.push(resolve);
            });
            _next([merge ? Object.assign({}, inProps, props) : props, providers]);
            return promise;
          };
        };

        var _resolveQueue = [];
        this.out$ = stream$.pipe((0, _operators.switchMap)(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
              props = _ref5[0],
              providers = _ref5[1];

          var piping = (0, _operators.tap)(function (props) {
            _this2.props = props;
            _this2.providers = providers;
            _resolveQueue.shift()();
          });

          if (!_this2.initialized) {
            _this2.props = props;
            _this2.providers = providers;
            setNext(props, providers);
            _this2.init();
            _this2.initialized = true;
            return (0, _rxjs.merge)(obs, subject).pipe(piping);
          } else {
            setNext(props, providers);
          }

          _this2.change(props, providers);
          return subject.pipe(piping);
        }));
      }

      return this;
    }
  }, {
    key: 'stream',
    value: function stream(stream$) {
      return stream$;
    }
  }, {
    key: 'init',
    value: function init() {}
  }, {
    key: 'change',
    value: function change(props, providers) {
      this.next(props);
    }
  }, {
    key: 'mount',
    value: function mount() {}
  }, {
    key: 'unmount',
    value: function unmount() {}
  }, {
    key: 'in$',
    get: function get() {
      throw ERR.NOT_PROVIDED;
    },
    set: function set(value) {
      Object.defineProperty(this, 'in$', { value: value });
    }
  }, {
    key: 'out$',
    get: function get() {
      throw ERR.NOT_PROVIDED;
    },
    set: function set(value) {
      Object.defineProperty(this, 'out$', { value: value });
    }
  }, {
    key: 'props$',
    get: function get() {
      throw ERR.NOT_INITIALIZED;
    },
    set: function set(value) {
      Object.defineProperty(this, 'props$', { value: value });
    }
  }, {
    key: 'providers$',
    get: function get() {
      throw ERR.NOT_INITIALIZED;
    },
    set: function set(value) {
      Object.defineProperty(this, 'providers$', { value: value });
    }
  }]);

  return Komfu;
}();

exports.default = Komfu;