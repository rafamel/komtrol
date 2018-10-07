'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = withObservable;

var _Komfu = require('../Komfu');

var _parseOpts3 = require('../parse-opts');

var _parseOpts4 = _interopRequireDefault(_parseOpts3);

var _operators = require('rxjs/operators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function withObservable() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _parseOpts = (0, _parseOpts4.default)({
    args: args,
    // TODO implement wait
    defaults: { as: null, wait: true },
    string: 'as'
  }),
      _parseOpts2 = _slicedToArray(_parseOpts, 2),
      opts = _parseOpts2[0],
      _parseOpts2$ = _slicedToArray(_parseOpts2[1], 1),
      cb = _parseOpts2$[0];

  return function (_PureKomfu) {
    _inherits(WithObservable, _PureKomfu);

    function WithObservable() {
      _classCallCheck(this, WithObservable);

      return _possibleConstructorReturn(this, (WithObservable.__proto__ || Object.getPrototypeOf(WithObservable)).apply(this, arguments));
    }

    _createClass(WithObservable, [{
      key: 'stream',

      // Lifecycle
      value: function stream(stream$) {
        var obs = void 0;
        return stream$.pipe((0, _operators.switchMap)(function (_ref) {
          var _ref2 = _toArray(_ref),
              props = _ref2[0],
              other = _ref2.slice(1);

          if (!obs) obs = cb.apply(undefined, [props].concat(_toConsumableArray(other)));
          return obs.pipe((0, _operators.map)(function (mergeProps) {
            return opts.as ? [Object.assign({}, props, _defineProperty({}, opts.as, mergeProps))].concat(_toConsumableArray(other)) : [Object.assign({}, props, mergeProps)].concat(_toConsumableArray(other));
          }));
        }));
      }
    }]);

    return WithObservable;
  }(_Komfu.PureKomfu);
}