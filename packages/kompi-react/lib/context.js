'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KompiConsumer = exports.KompiProvider = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _React$createContext = _react2.default.createContext(),
    KompiProvider = _React$createContext.Provider,
    KompiConsumer = _React$createContext.Consumer;

KompiProvider.displayName = 'KompiProvider';
KompiConsumer.displayName = 'KompiConsumer';

exports.KompiProvider = KompiProvider;
exports.KompiConsumer = KompiConsumer;