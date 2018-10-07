"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withState;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function withState(name, setterName, initialState) {
  return {
    // Middleware-specific
    value: initialState,
    setValue: function setValue(value) {
      this.value = value;
      this.doNext();
    },
    doNext: function doNext() {
      var _next;

      return this.next((_next = {}, _defineProperty(_next, name, this.value), _defineProperty(_next, setterName, this.setValue), _next), { merge: true });
    },

    // Lifecycle
    change: function change(props, providers) {
      return this.doNext();
    }
  };
}