'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = parseOpts;
function parseOpts() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      args = _ref.args,
      _ref$defaults = _ref.defaults,
      defaults = _ref$defaults === undefined ? {} : _ref$defaults,
      string = _ref.string;

  var options = {};
  if (args[1] !== undefined) {
    if (_typeof(args[0]) === 'object') {
      options = args.shift();
    } else if (string && typeof args[0] === 'string') {
      var str = args.shift();
      options[string] = str;
    }
  }
  return [Object.assign({}, defaults, options), args];
}