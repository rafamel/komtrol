'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collection;

var _Kompi = require('./Kompi');

var _Kompi2 = _interopRequireDefault(_Kompi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function collection() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return {
    options: {
      pure: true
    },
    stream: function stream(stream$) {
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
        var middleware = middlewares[i];
        var kompi = new _Kompi2.default(middleware, getCollection(i));
        kompi.provide(stream$);
        all.push(kompi);
        stream$ = kompi.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    },
    mount: function mount() {
      this.all.forEach(function (kompi) {
        return kompi.mount();
      });
    },
    unmount: function unmount() {
      this.all.forEach(function (kompi) {
        return kompi.unmount();
      });
    }
  };
}