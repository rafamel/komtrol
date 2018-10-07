'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KomfuConsumer = exports.KomfuProvider = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _React$createContext = _react2.default.createContext(),
    KomfuProvider = _React$createContext.Provider,
    KomfuConsumer = _React$createContext.Consumer;

KomfuProvider.displayName = 'KomfuProvider';
KomfuConsumer.displayName = 'KomfuConsumer';

exports.KomfuProvider = KomfuProvider;
exports.KomfuConsumer = KomfuConsumer;