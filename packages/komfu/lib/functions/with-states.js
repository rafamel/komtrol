'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = withStates;

var _Komfu2 = require('../Komfu');

var _Komfu3 = _interopRequireDefault(_Komfu2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// withState({ prop1: 'Initial val', prop2: '2nd Initial val' });
function withStates(obj) {
  return function (_Komfu) {
    _inherits(WithStates, _Komfu);

    function WithStates() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, WithStates);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WithStates.__proto__ || Object.getPrototypeOf(WithStates)).call.apply(_ref, [this].concat(args))), _this), _this.all = {}, _temp), _possibleConstructorReturn(_this, _ret);
    }
    // Middleware-specific


    _createClass(WithStates, [{
      key: 'doNext',
      value: function doNext() {
        return this.next(this.all, { merge: true });
      }
      // Lifecycle

    }, {
      key: 'init',
      value: function init() {
        var _this2 = this;

        this.all = Object.keys(obj).reduce(function (acc, key) {
          acc[key] = {
            value: obj[key],
            set: function set(value) {
              _this2.all[key].value = value;
              _this2.doNext();
            }
          };
          return acc;
        }, {});
      }
    }, {
      key: 'change',
      value: function change(props, providers) {
        return this.doNext();
      }
    }]);

    return WithStates;
  }(_Komfu3.default);
}