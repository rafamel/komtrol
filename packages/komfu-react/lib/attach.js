'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = attach;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _context = require('./context');

var _komfu = require('komfu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Must be the same object, otherwise Subjects shallow equality
// won't work. Setting as constant
var DEFAULT_CONTEXT = {};

function attach() {
  for (var _len = arguments.length, middleware = Array(_len), _key = 0; _key < _len; _key++) {
    middleware[_key] = arguments[_key];
  }

  if (middleware[1]) middleware = _komfu.collection.apply(undefined, _toConsumableArray(middleware));else middleware = middleware[0];

  return function (Component) {
    return function (_React$Component) {
      _inherits(KomfuAttach, _React$Component);

      function KomfuAttach() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, KomfuAttach);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = KomfuAttach.__proto__ || Object.getPrototypeOf(KomfuAttach)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
          props: null
        }, _this.subjects = new _komfu.Subjects(), _this.sec = new _komfu.Subjects(), _this.komfu = new _komfu.Komfu(middleware).provide(_this.subjects.$), _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(KomfuAttach, [{
        key: 'UNSAFE_componentWillReceiveProps',

        // eslint-disable-next-line camelcase
        value: function UNSAFE_componentWillReceiveProps(props) {
          if (this._isMounted) this.subjects.props(props);
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this2 = this;

          this.komfu.mount();
          this.subjects.props(this.props);
          this._isMounted = true;

          this.subscription = this.komfu.out$.subscribe(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 1),
                props = _ref3[0];

            if (_this2._isMounted) _this2.setState({ props: props });
          });
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this._isMounted = false;
          this.subscription.unsubscribe();
          this.komfu.unmount();
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
          return this.state.props !== nextState.props || !this.subjects.ready;
        }
      }, {
        key: 'render',
        value: function render() {
          var _this3 = this;

          return _react2.default.createElement(
            _context.KomfuConsumer,
            null,
            function (context) {
              _this3.subjects.context(context || DEFAULT_CONTEXT);
              return _this3.state.props ? _react2.default.createElement(Component, _this3.state.props) : null;
            }
          );
        }
      }]);

      return KomfuAttach;
    }(_react2.default.Component);
  };
}