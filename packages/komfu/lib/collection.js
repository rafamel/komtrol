'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collection;

var _Komfu = require('./Komfu');

var _Komfu2 = _interopRequireDefault(_Komfu);

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
        var komfu = new _Komfu2.default(middleware, getCollection(i));
        komfu.provide(stream$);
        all.push(komfu);
        stream$ = komfu.out$;
      }

      this.all = all;
      return all[all.length - 1].out$;
    },
    mount: function mount() {
      this.all.forEach(function (komfu) {
        return komfu.mount();
      });
    },
    unmount: function unmount() {
      this.all.forEach(function (komfu) {
        return komfu.unmount();
      });
    }
  };
}