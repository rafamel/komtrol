'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ERR = {
  NOT_PROVIDED: new Error("Komfu instance hasn't been provided for yet: komfu.provide(in$)."),
  NOT_INITIALIZED: new Error('Komfu instance has not been initialized yet.')
};

var BaseKomfu = function () {
  function BaseKomfu(collection) {
    _classCallCheck(this, BaseKomfu);

    this.collection = collection || null;
  }

  _createClass(BaseKomfu, [{
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
  }]);

  return BaseKomfu;
}();

exports.default = BaseKomfu;