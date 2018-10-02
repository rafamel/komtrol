'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KompiConsumer = exports.KompiProvider = exports.attach = undefined;

var _context = require('./context');

Object.defineProperty(exports, 'KompiProvider', {
  enumerable: true,
  get: function get() {
    return _context.KompiProvider;
  }
});
Object.defineProperty(exports, 'KompiConsumer', {
  enumerable: true,
  get: function get() {
    return _context.KompiConsumer;
  }
});

var _attach = require('./attach');

var _attach2 = _interopRequireDefault(_attach);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  type: 'view',
  attach: _attach2.default
};
exports.attach = _attach2.default;