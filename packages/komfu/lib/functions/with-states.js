"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withStates;
// withState({ prop1: 'Initial val', prop2: '2nd Initial val' });
function withStates(obj) {
  return {
    // Middleware-specific
    all: {},
    doNext: function doNext() {
      return this.next(this.all, { merge: true });
    },

    // Lifecycle
    init: function init() {
      var _this = this;

      this.all = Object.keys(obj).reduce(function (acc, key) {
        acc[key] = {
          value: obj[key],
          set: function set(value) {
            _this.all[key].value = value;
            _this.doNext();
          }
        };
        return acc;
      }, {});
    },
    change: function change(props, providers) {
      return this.doNext();
    }
  };
}