'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = collection;

var _Komfu = require('./Komfu');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function collection() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (_PureKomfu) {
    _inherits(Collection, _PureKomfu);

    function Collection() {
      _classCallCheck(this, Collection);

      return _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).apply(this, arguments));
    }

    _createClass(Collection, [{
      key: 'stream',
      value: function stream(stream$) {
        var all = [];

        var getCollection = function getCollection(i) {
          return {
            all: all,
            index: i,
            get parent() {
              return this.collection[i - 1] || null;
            },
            get child() {
              return this.collection[i + 1] || null;
            }
          };
        };

        for (var i = 0; i < middlewares.length; i++) {
          var Middleware = middlewares[i];
          var middleware = new Middleware(getCollection(i));
          middleware.provide(stream$);
          all.push(middleware);
          stream$ = middleware.out$;
        }

        this.all = all;
        return all[all.length - 1].out$;
      }
    }, {
      key: 'mount',
      value: function mount() {
        this.all.forEach(function (middleware) {
          return middleware.mount();
        });
      }
    }, {
      key: 'unmount',
      value: function unmount() {
        this.all.forEach(function (middleware) {
          return middleware.unmount();
        });
      }
    }]);

    return Collection;
  }(_Komfu.PureKomfu);
}